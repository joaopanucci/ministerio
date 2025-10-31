#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gerador de SVG para Sistema Web de Mapas - Mato Grosso do Sul
Integração com mapa.js, HTML e CSS
Descrição: Processa dados CSV e JSON para gerar SVGs consumidos pelo frontend
"""

import json
import pandas as pd
import os
import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET
from datetime import datetime

class GeradorSVGWeb:
    def __init__(self):
        # Ajusta paths baseado na localização do script em src/python/
        self.base_path = Path(__file__).parent.parent.parent  # Volta para raiz do projeto
        self.regioes_path = self.base_path / "REGIAO"
        self.svg_output_path = self.base_path / "src" / "svg"
        self.dados_output_path = self.base_path / "src" / "data"
        
        # Cria diretórios de saída
        self.svg_output_path.mkdir(parents=True, exist_ok=True)
        self.dados_output_path.mkdir(parents=True, exist_ok=True)
        
        self.dados_regioes = {}
        
        # Configurações do SVG (otimizado para web)
        self.svg_width = 1000
        self.svg_height = 700
        self.bounds = None
        
        # Cores consistentes com o sistema web
        self.cores_faixas = {
            'muito_alto': '#2e7d32',    # Verde escuro (80-100%)
            'alto': '#388e3c',          # Verde médio (60-79%)
            'medio': '#66bb6a',         # Verde claro (40-59%)
            'baixo': '#a5d6a7',         # Verde muito claro (20-39%)
            'muito_baixo': '#c8e6c9',   # Verde paleado (0-19%)
            'sem_dados': '#e0e0e0'     # Cinza para municípios sem dados
        }
        
        # Mapeamento de indicadores (consistente com mapa.js)
        self.indicadores_mapeamento = {
            'emulti-acoes': {
                'nome': 'Ações Interprofissionais da eMulti',
                'pasta': 'EQUIPES MULTIPROFISSIONAIS NA APS/AÇÕES INTERPROFISSIONAIS DA EMULTI'
            },
            'emulti-media': {
                'nome': 'Média de Atendimento da eMulti por Pessoa',
                'pasta': 'EQUIPES MULTIPROFISSIONAIS NA APS/MÉDIA DE ATENDIMENTO DA EMULTI POR PESSOA'
            },
            'esf-desenvolvimento': {
                'nome': 'Desenvolvimento Infantil',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/DESENVOLVIMENTO INFANTIL'
            },
            'esf-diabetes': {
                'nome': 'Cuidado da pessoa com Diabetes',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/DIABETES'
            },
            'esf-gestante': {
                'nome': 'Gestante e Puérpera',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/GESTANTE E PUÉRPERA'
            },
            'esf-hipertensao': {
                'nome': 'Hipertensão Arterial',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/HIPERTENSÃO ARTERIAL'
            },
            'esf-mais-acesso': {
                'nome': 'Mais Acesso',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/MAIS ACESSO'
            },
            'esf-idosa': {
                'nome': 'Pessoa Idosa',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/PESSOA IDOSA'
            },
            'esf-cancer-mulher': {
                'nome': 'Prevenção do Câncer na Mulher',
                'pasta': 'ESTRATÉGIA SAÚDE DA FAMILIA NA APS/PREVENÇÃO DO CÂNCER NA MULHER'
            },
            'sb-primeira-consulta': {
                'nome': '1ª Consulta Odontológica',
                'pasta': 'SAÚDE BUCAL NA APS/1ª CONSULTA ODONTOLÓGICA'
            },
            'sb-escovacao': {
                'nome': 'Escovação Supervisionada',
                'pasta': 'SAÚDE BUCAL NA APS/ESCOVAÇÃO SUPERVISIONADA'
            },
            'sb-preventivos': {
                'nome': 'Procedimentos Odontológicos Preventivos',
                'pasta': 'SAÚDE BUCAL NA APS/PROCEDIMENTOS ODONTOLÓGICOS PREVENTIVOS'
            },
            'sb-exodontias': {
                'nome': 'Taxa de Exodontias',
                'pasta': 'SAÚDE BUCAL NA APS/TAXA DE EXODONTIAS'
            },
            'sb-tratamento-concluido': {
                'nome': 'Tratamento Odontológico Concluído',
                'pasta': 'SAÚDE BUCAL NA APS/TRATAMENTO ODONTOLÓGICO CONCLUIDO'
            },
            'sb-tratamento-atraumatico': {
                'nome': 'Tratamento Restaurador Atraumático',
                'pasta': 'SAÚDE BUCAL NA APS/TRATAMENTO RESTAURADOR ATRAUMATICO'
            }
        }
    
    def log(self, mensagem, tipo="INFO"):
        """Sistema de log para comunicação com JS"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {tipo}: {mensagem}")
        sys.stdout.flush()
    
    def carregar_dados_regioes(self):
        """Carrega dados GeoJSON das microrregiões"""
        self.log("Carregando dados das microrregiões...")
        
        arquivos_json = list(self.regioes_path.glob("*.json"))
        
        for arquivo in arquivos_json:
            try:
                with open(arquivo, 'r', encoding='utf-8') as f:
                    dados = json.load(f)
                
                nome_regiao = arquivo.stem
                self.dados_regioes[nome_regiao] = dados
                
                municipios_count = len(dados.get('features', []))
                self.log(f"Região {nome_regiao}: {municipios_count} municípios")
                
            except Exception as e:
                self.log(f"Erro ao carregar {arquivo.name}: {e}", "ERROR")
        
        self.log(f"Total: {len(self.dados_regioes)} regiões carregadas")
        return len(self.dados_regioes) > 0
    
    def calcular_bounds(self):
        """Calcula limites geográficos para normalização"""
        min_x, min_y = float('inf'), float('inf')
        max_x, max_y = float('-inf'), float('-inf')
        
        for dados_regiao in self.dados_regioes.values():
            if 'features' not in dados_regiao:
                continue
            
            for feature in dados_regiao['features']:
                geometry = feature.get('geometry', {})
                if geometry.get('type') != 'Polygon':
                    continue
                
                coordinates = geometry['coordinates'][0]
                for lng, lat in coordinates:
                    min_x, max_x = min(min_x, lng), max(max_x, lng)
                    min_y, max_y = min(min_y, lat), max(max_y, lat)
        
        self.bounds = {
            'min_x': min_x, 'max_x': max_x,
            'min_y': min_y, 'max_y': max_y,
            'width': max_x - min_x,
            'height': max_y - min_y
        }
        
        self.log(f"Bounds calculados: {self.bounds['width']:.3f} x {self.bounds['height']:.3f}")
    
    def converter_coordenadas(self, lng, lat):
        """Converte coordenadas geográficas para SVG"""
        if not self.bounds:
            return 0, 0
        
        # Adiciona margem de 5% em cada lado
        margin = 0.05
        effective_width = self.svg_width * (1 - 2 * margin)
        effective_height = self.svg_height * (1 - 2 * margin)
        
        x = margin * self.svg_width + ((lng - self.bounds['min_x']) / self.bounds['width']) * effective_width
        y = self.svg_height - (margin * self.svg_height + ((lat - self.bounds['min_y']) / self.bounds['height']) * effective_height)
        
        return x, y
    
    def extrair_dados_municipio_csv(self, info_municipio):
        """Extrai código IBGE e nome do formato '500025 / ALCINÓPOLIS'"""
        if pd.isna(info_municipio):
            return None, None
        
        info_str = str(info_municipio).strip()
        
        # Extrai código IBGE
        match_codigo = re.match(r'^(\d{6})', info_str)
        codigo = match_codigo.group(1) if match_codigo else None
        
        # Extrai nome do município
        match_nome = re.search(r'/\s*(.+)$', info_str)
        nome = match_nome.group(1).strip() if match_nome else None
        
        return codigo, nome
    
    def carregar_dados_csv_indicador(self, codigo_indicador):
        """Carrega dados CSV para um indicador específico"""
        if codigo_indicador not in self.indicadores_mapeamento:
            self.log(f"Indicador não encontrado: {codigo_indicador}", "ERROR")
            return {}
        
        config = self.indicadores_mapeamento[codigo_indicador]
        pasta_indicador = self.base_path / config['pasta']
        
        self.log(f"Carregando dados: {config['nome']}")
        
        if not pasta_indicador.exists():
            self.log(f"Pasta não encontrada: {pasta_indicador}", "ERROR")
            return {}
        
        dados_municipios = {}
        arquivos_processados = 0
        
        # Processa todos os CSV da pasta
        for arquivo_csv in pasta_indicador.glob("*.csv"):
            try:
                # Lê CSV pulando cabeçalho (linhas 0-14)
                df = pd.read_csv(arquivo_csv, sep=';', skiprows=15, encoding='utf-8', low_memory=False)
                
                if df.empty:
                    continue
                
                for _, row in df.iterrows():
                    if len(row) < 2:
                        continue
                    
                    codigo, nome = self.extrair_dados_municipio_csv(row.iloc[0])
                    
                    if not codigo:
                        continue
                    
                    # Pontuação na última coluna
                    try:
                        pontuacao_str = str(row.iloc[-1]).replace(',', '.')
                        pontuacao = float(pontuacao_str)
                        
                        dados_municipios[codigo] = {
                            'nome': nome or 'Nome não identificado',
                            'pontuacao': pontuacao,
                            'arquivo_origem': arquivo_csv.name
                        }
                        
                    except (ValueError, TypeError):
                        continue
                
                arquivos_processados += 1
                
            except Exception as e:
                self.log(f"Erro processando {arquivo_csv.name}: {e}", "ERROR")
        
        self.log(f"Processados {arquivos_processados} arquivos, {len(dados_municipios)} municípios")
        return dados_municipios
    
    def obter_cor_por_pontuacao(self, pontuacao):
        """Retorna cor baseada na pontuação"""
        if pontuacao is None or pd.isna(pontuacao):
            return self.cores_faixas['sem_dados']
        elif pontuacao >= 80:
            return self.cores_faixas['muito_alto']
        elif pontuacao >= 60:
            return self.cores_faixas['alto']
        elif pontuacao >= 40:
            return self.cores_faixas['medio']
        elif pontuacao >= 20:
            return self.cores_faixas['baixo']
        else:
            return self.cores_faixas['muito_baixo']
    
    def gerar_svg_indicador(self, codigo_indicador, dados_csv):
        """Gera SVG para um indicador específico"""
        config = self.indicadores_mapeamento[codigo_indicador]
        
        # Elemento SVG raiz
        svg = ET.Element('svg', {
            'width': str(self.svg_width),
            'height': str(self.svg_height),
            'viewBox': f'0 0 {self.svg_width} {self.svg_height}',
            'xmlns': 'http://www.w3.org/2000/svg',
            'id': f'mapa-{codigo_indicador}'
        })
        
        # Estilos CSS integrados
        style = ET.SubElement(svg, 'style')
        style.text = f"""
        <![CDATA[
        .municipio {{
            stroke: #ffffff;
            stroke-width: 0.8;
            cursor: pointer;
            transition: all 0.3s ease;
        }}
        .municipio:hover {{
            stroke-width: 2;
            opacity: 0.8;
            filter: brightness(1.1);
        }}
        .regiao-grupo {{
            pointer-events: all;
        }}
        .titulo-mapa {{
            font-family: 'Arial', sans-serif;
            font-size: 24px;
            font-weight: bold;
            fill: #333;
        }}
        ]]>
        """
        
        # Título do mapa
        titulo = ET.SubElement(svg, 'text', {
            'x': str(self.svg_width // 2),
            'y': '30',
            'text-anchor': 'middle',
            'class': 'titulo-mapa'
        })
        titulo.text = config['nome']
        
        # Grupo principal dos municípios
        grupo_municipios = ET.SubElement(svg, 'g', {
            'id': 'municipios',
            'transform': 'translate(0, 50)'  # Espaço para título
        })
        
        municipios_renderizados = 0
        
        # Processa cada região
        for nome_regiao, dados_regiao in self.dados_regioes.items():
            if 'features' not in dados_regiao:
                continue
            
            grupo_regiao = ET.SubElement(grupo_municipios, 'g', {
                'id': f'regiao-{nome_regiao}',
                'class': 'regiao-grupo',
                'data-regiao': nome_regiao
            })
            
            for feature in dados_regiao['features']:
                properties = feature.get('properties', {})
                geometry = feature.get('geometry', {})
                
                if geometry.get('type') != 'Polygon':
                    continue
                
                codigo_municipio = properties.get('CD_MUN')
                nome_municipio = properties.get('NM_MUN', 'Município')
                
                if not codigo_municipio:
                    continue
                
                # Busca dados do indicador
                dados_mun = dados_csv.get(codigo_municipio, {})
                pontuacao = dados_mun.get('pontuacao')
                cor = self.obter_cor_por_pontuacao(pontuacao)
                
                # Converte geometria para SVG
                coordinates = geometry['coordinates'][0]
                pontos_svg = []
                
                for lng, lat in coordinates:
                    x, y = self.converter_coordenadas(lng, lat)
                    pontos_svg.append(f"{x:.1f},{y:.1f}")
                
                if not pontos_svg:
                    continue
                
                pontos_str = " ".join(pontos_svg)
                
                # Atributos do polígono
                attrs_poligono = {
                    'points': pontos_str,
                    'fill': cor,
                    'class': 'municipio',
                    'data-codigo': codigo_municipio,
                    'data-nome': nome_municipio,
                    'data-regiao': nome_regiao,
                    'data-pontuacao': str(pontuacao or 0),
                    'data-classificacao': self.obter_classificacao(pontuacao),
                    'id': f'municipio-{codigo_municipio}'
                }
                
                poligono = ET.SubElement(grupo_regiao, 'polygon', attrs_poligono)
                
                # Tooltip nativo
                titulo_tooltip = ET.SubElement(poligono, 'title')
                titulo_tooltip.text = f"{nome_municipio}\nPontuação: {pontuacao:.1f}%" if pontuacao else f"{nome_municipio}\nSem dados"
                
                municipios_renderizados += 1
        
        self.log(f"SVG gerado: {municipios_renderizados} municípios renderizados")
        return svg
    
    def obter_classificacao(self, pontuacao):
        """Classificação textual da pontuação"""
        if pontuacao is None or pd.isna(pontuacao):
            return "Sem dados"
        elif pontuacao >= 80:
            return "Muito Alto"
        elif pontuacao >= 60:
            return "Alto"
        elif pontuacao >= 40:
            return "Médio"
        elif pontuacao >= 20:
            return "Baixo"
        else:
            return "Muito Baixo"
    
    def salvar_svg(self, svg_element, nome_arquivo):
        """Salva SVG em arquivo"""
        arquivo_path = self.svg_output_path / nome_arquivo
        
        # Formatação e salvamento
        ET.indent(svg_element, space="  ")
        tree = ET.ElementTree(svg_element)
        
        with open(arquivo_path, 'wb') as f:
            tree.write(f, encoding='utf-8', xml_declaration=True)
        
        self.log(f"SVG salvo: {arquivo_path}")
        return arquivo_path
    
    def gerar_dados_json_web(self, codigo_indicador, dados_csv):
        """Gera JSON para consumo pelo JavaScript"""
        config = self.indicadores_mapeamento[codigo_indicador]
        
        dados_web = {
            'indicador': {
                'codigo': codigo_indicador,
                'nome': config['nome'],
                'timestamp': datetime.now().isoformat()
            },
            'estatisticas': {
                'total_municipios': len(dados_csv),
                'municipios_com_dados': len([d for d in dados_csv.values() if d['pontuacao'] is not None])
            },
            'dados_municipios': {},
            'cores_legenda': self.cores_faixas
        }
        
        # Calcula estatísticas de pontuação
        pontuacoes = [d['pontuacao'] for d in dados_csv.values() if d['pontuacao'] is not None]
        
        if pontuacoes:
            dados_web['estatisticas'].update({
                'pontuacao_maxima': max(pontuacoes),
                'pontuacao_minima': min(pontuacoes),
                'pontuacao_media': sum(pontuacoes) / len(pontuacoes)
            })
        
        # Dados detalhados por município
        for codigo, dados in dados_csv.items():
            pontuacao = dados['pontuacao']
            dados_web['dados_municipios'][codigo] = {
                'nome': dados['nome'],
                'pontuacao': pontuacao,
                'cor': self.obter_cor_por_pontuacao(pontuacao),
                'classificacao': self.obter_classificacao(pontuacao)
            }
        
        # Salva JSON
        nome_arquivo = f"{codigo_indicador}_dados.json"
        arquivo_path = self.dados_output_path / nome_arquivo
        
        with open(arquivo_path, 'w', encoding='utf-8') as f:
            json.dump(dados_web, f, ensure_ascii=False, indent=2)
        
        self.log(f"JSON salvo: {arquivo_path}")
        return arquivo_path
    
    def processar_indicador_completo(self, codigo_indicador):
        """Processa indicador gerando SVG e JSON"""
        self.log(f"=== PROCESSANDO INDICADOR: {codigo_indicador} ===")
        
        if not self.dados_regioes:
            self.log("Dados das regiões não carregados!", "ERROR")
            return None
        
        # Carrega dados CSV
        dados_csv = self.carregar_dados_csv_indicador(codigo_indicador)
        if not dados_csv:
            self.log("Nenhum dado CSV encontrado!", "ERROR")
            return None
        
        # Gera SVG
        svg_element = self.gerar_svg_indicador(codigo_indicador, dados_csv)
        nome_svg = f"{codigo_indicador}_mapa.svg"
        arquivo_svg = self.salvar_svg(svg_element, nome_svg)
        
        # Gera JSON
        arquivo_json = self.gerar_dados_json_web(codigo_indicador, dados_csv)
        
        resultado = {
            'indicador': codigo_indicador,
            'svg_path': str(arquivo_svg),
            'json_path': str(arquivo_json),
            'municipios_processados': len(dados_csv),
            'sucesso': True
        }
        
        self.log(f"=== CONCLUÍDO: {codigo_indicador} ===")
        return resultado

def main():
    """Função principal - pode ser chamada via linha de comando ou importada"""
    if len(sys.argv) > 1:
        # Modo linha de comando
        codigo_indicador = sys.argv[1]
        
        gerador = GeradorSVGWeb()
        
        # Inicialização
        if not gerador.carregar_dados_regioes():
            print("ERRO: Falha ao carregar dados das regiões")
            sys.exit(1)
        
        gerador.calcular_bounds()
        
        # Processa indicador específico
        resultado = gerador.processar_indicador_completo(codigo_indicador)
        
        if resultado and resultado['sucesso']:
            # Retorna JSON do resultado para o JavaScript
            print(json.dumps(resultado))
            sys.exit(0)
        else:
            print(json.dumps({'sucesso': False, 'erro': 'Falha no processamento'}))
            sys.exit(1)
    
    else:
        # Modo interativo
        print("🗺️  GERADOR SVG WEB - MATO GROSSO DO SUL")
        print("="*50)
        
        gerador = GeradorSVGWeb()
        
        if not gerador.carregar_dados_regioes():
            print("❌ Erro ao carregar dados das regiões")
            return
        
        gerador.calcular_bounds()
        
        print("\nIndicadores disponíveis:")
        for i, (codigo, config) in enumerate(gerador.indicadores_mapeamento.items(), 1):
            print(f"{i}. {codigo}: {config['nome']}")
        
        escolha = input("\nEscolha um indicador ou 'todos': ").strip()
        
        if escolha.lower() == 'todos':
            for codigo in gerador.indicadores_mapeamento.keys():
                resultado = gerador.processar_indicador_completo(codigo)
                if resultado:
                    print(f"✅ {codigo} processado com sucesso")
        else:
            try:
                indice = int(escolha) - 1
                codigos = list(gerador.indicadores_mapeamento.keys())
                if 0 <= indice < len(codigos):
                    codigo = codigos[indice]
                    resultado = gerador.processar_indicador_completo(codigo)
                    if resultado:
                        print(f"✅ {codigo} processado com sucesso")
                        print(f"📄 SVG: {resultado['svg_path']}")
                        print(f"📊 JSON: {resultado['json_path']}")
            except ValueError:
                print("❌ Entrada inválida")

if __name__ == "__main__":
    main()
