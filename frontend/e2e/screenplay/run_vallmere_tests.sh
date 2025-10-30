#!/bin/bash
# Shell script para ejecutar las pruebas E2E de Vallmere en Linux/macOS
# Autor: Equipo QA Automation
# Fecha: 30 de Octubre, 2025

echo "========================================"
echo "  VALLMERE E2E TESTS - ScreenPlay"
echo "========================================"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "tests/test_01_login_success_client.py" ]; then
    echo "❌ ERROR: No se encontraron los tests de Vallmere."
    echo "Asegúrate de ejecutar este script desde: frontend/e2e/screenplay/"
    exit 1
fi

# Activar entorno virtual
if [ -f "venv/bin/activate" ]; then
    echo "[1/4] Activando entorno virtual..."
    source venv/bin/activate
else
    echo "⚠️  ADVERTENCIA: No se encontró el entorno virtual."
    echo "Por favor ejecuta primero: python3 -m venv venv"
    echo "Y luego: pip install -r requirements.txt"
    exit 1
fi

# Verificar que la aplicación Angular esté corriendo
echo "[2/4] Verificando que la aplicación Angular esté corriendo..."
if ! curl -s http://localhost:4200 > /dev/null 2>&1; then
    echo ""
    echo "❌ ERROR: La aplicación Angular no está corriendo en http://localhost:4200"
    echo ""
    echo "Por favor, en otra terminal ejecuta:"
    echo "   cd frontend"
    echo "   npm start"
    echo ""
    read -p "Presiona Enter cuando la aplicación esté lista..."
fi

# Ejecutar tests
echo "[3/4] Ejecutando tests de Vallmere..."
echo ""
pytest -v --html=report.html --self-contained-html tests/test_0*.py tests/test_15*.py

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "  ✅ TODOS LOS TESTS PASARON!"
    echo "========================================"
    echo ""
    echo "[4/4] Abriendo reporte HTML..."
    
    # Abrir reporte según el sistema operativo
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open report.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        xdg-open report.html 2>/dev/null || echo "Abre manualmente: report.html"
    fi
    
    echo ""
    echo "📸 Screenshots guardados en: screenshots/"
    echo ""
else
    echo ""
    echo "========================================"
    echo "  ❌ TESTS FALLIDOS - Revisa los errores"
    echo "========================================"
    echo ""
    echo "Abriendo reporte..."
    
    # Abrir reporte según el sistema operativo
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open report.html
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open report.html 2>/dev/null || echo "Abre manualmente: report.html"
    fi
    
    exit 1
fi

