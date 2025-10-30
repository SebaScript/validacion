@echo off
REM Batch script para ejecutar las pruebas E2E de Vallmere en Windows
REM Autor: Equipo QA Automation
REM Fecha: 30 de Octubre, 2025

echo ========================================
echo   VALLMERE E2E TESTS - ScreenPlay
echo ========================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "tests\test_01_login_success_client.py" (
    echo ERROR: No se encontraron los tests de Vallmere.
    echo Asegurate de ejecutar este script desde: frontend\e2e\screenplay\
    pause
    exit /b 1
)

REM Activar entorno virtual
if exist "venv\Scripts\activate.bat" (
    echo [1/4] Activando entorno virtual...
    call venv\Scripts\activate.bat
) else (
    echo ADVERTENCIA: No se encontro el entorno virtual.
    echo Por favor ejecuta primero: py -m venv venv
    echo Y luego: pip install -r requirements.txt
    pause
    exit /b 1
)

REM Verificar que la aplicación Angular esté corriendo
echo [2/4] Verificando que la aplicacion Angular este corriendo...
curl -s http://localhost:4200 > nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: La aplicacion Angular no esta corriendo en http://localhost:4200
    echo.
    echo Por favor, en otra terminal ejecuta:
    echo    cd frontend
    echo    npm start
    echo.
    echo Presiona cualquier tecla cuando la aplicacion este lista...
    pause > nul
)

REM Ejecutar tests
echo [3/4] Ejecutando tests de Vallmere...
echo.
pytest -v --html=report.html --self-contained-html tests/

REM Verificar resultado
if errorlevel 1 (
    echo.
    echo ========================================
    echo   TESTS FALLIDOS - Revisa los errores
    echo ========================================
    echo.
    echo Abriendo reporte...
    start report.html
    pause
    exit /b 1
) else (
    echo.
    echo ========================================
    echo   TODOS LOS TESTS PASARON!
    echo ========================================
    echo.
    echo [4/4] Abriendo reporte HTML...
    start report.html
    echo.
    echo Screenshots guardados en: screenshots\
    echo.
    pause
)

