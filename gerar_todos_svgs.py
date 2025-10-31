#!/usr/bin/env python3
"""
Script para gerar todos os SVGs dos indicadores de saúde
Automatiza a criação de mapas para visualização web
"""

import os
import sys
import subprocess
from datetime import datetime

def executar_comando(comando, indicador):
    """Executa comando e captura saída"""
    print(f"\n{'='*60}")
    print(f"🔄 Gerando SVG para: {indicador}")
    print(f"{'='*60}")
    
    try:
        resultado = subprocess.run(
            comando, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        if resultado.returncode == 0:
            print(f"✅ Sucesso: {indicador}")
            # Mostra apenas as linhas de log importantes
            linhas = resultado.stdout.strip().split('\n')
            for linha in linhas:
                if any(palavra in linha for palavra in ['INFO:', 'municipios', 'SVG', 'JSON']):
                    print(f"   {linha}")
        else:
            print(f"❌ Erro: {indicador}")
            print(f"   {resultado.stderr}")
            
        return resultado.returncode == 0
        
    except Exception as e:
        print(f"❌ Exceção: {indicador} - {e}")
        return False

def main():
    """Função principal"""
    print("🗺️  GERADOR DE MAPAS SVG - INDICADORES DE SAÚDE MS")
    print("=" * 60)
    print(f"Iniciado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    
    # Lista de todos os indicadores disponíveis
    indicadores = [
        # Equipes Multiprofissionais
        'emulti-acoes',
        'emulti-media',
        
        # Estratégia Saúde da Família
        'esf-desenvolvimento',
        'esf-diabetes', 
        'esf-gestante',
        'esf-hipertensao',
        'esf-mais-acesso',
        'esf-idosa',
        'esf-cancer-mulher',
        
        # Saúde Bucal
        'sb-primeira-consulta',
        'sb-escovacao',
        'sb-preventivos',
        'sb-exodontias',
        'sb-tratamento-concluido',
        'sb-tratamento-atraumatico'
    ]
    
    sucessos = 0
    falhas = 0
    
    for indicador in indicadores:
        comando = f"python src/python/mapa.py {indicador}"
        
        if executar_comando(comando, indicador):
            sucessos += 1
        else:
            falhas += 1
    
    # Relatório final
    print(f"\n{'='*60}")
    print("📊 RELATÓRIO FINAL")
    print(f"{'='*60}")
    print(f"✅ Sucessos: {sucessos}")
    print(f"❌ Falhas: {falhas}")
    print(f"📊 Total: {len(indicadores)}")
    print(f"🕒 Concluído em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    
    if falhas == 0:
        print("\n🎉 Todos os SVGs foram gerados com sucesso!")
        print("📁 Arquivos disponíveis em:")
        print("   - /src/svg/ (mapas SVG)")
        print("   - /src/data/ (dados JSON)")
        print("\n🌐 Para testar:")
        print("   python -m http.server 8080")
        print("   http://localhost:8080")
    else:
        print(f"\n⚠️  {falhas} indicador(es) falharam. Verifique os logs acima.")
    
    return falhas == 0

if __name__ == "__main__":
    try:
        sucesso = main()
        sys.exit(0 if sucesso else 1)
    except KeyboardInterrupt:
        print("\n\n⏸️  Interrompido pelo usuário.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)