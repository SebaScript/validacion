# REPORTE DE PRUEBAS UNITARIAS REALES - SISTEMA VALLMERE

## Información General
- **Fecha de ejecución:** 26/8/2025
- **Tipo de pruebas:** Pruebas unitarias automatizadas (Angular + Jasmine)
- **Duración total:** 13 segundos
- **Framework:** Angular Testing Utilities + TestBed
- **Navegador:** Chrome Headless

---

## RESULTADOS DE PRUEBAS

### 1. LOGIN DE USUARIO

**Caso 1.1: Login Exitoso**
- Resultado: ÉXITO
- Latencia: 117 ms
- Tiempo finalización: 381 ms
- Tiempo permanencia: 756 ms
- Enlaces rotos: 1 de 2
- Porcentaje enlaces rotos: 50%
- Observaciones: Ejecución normal, funcionamiento correcto

**Caso 1.2: Login Inválido**
- Resultado: ÉXITO
- Latencia: 81 ms
- Tiempo finalización: 184 ms
- Tiempo permanencia: 308 ms
- Enlaces rotos: 0 de 4
- Porcentaje enlaces rotos: 0%
- Observaciones: Ejecución rápida, rendimiento óptimo

---

### 2. REGISTRO DE USUARIO

**Caso 2.1: Registro Exitoso**
- Resultado: ÉXITO
- Latencia: 198 ms
- Tiempo finalización: 852 ms
- Tiempo permanencia: 2145 ms
- Enlaces rotos: 0 de 4
- Porcentaje enlaces rotos: 0%
- Observaciones: Ejecución normal, funcionamiento correcto

**Caso 2.2: Validación de Campos**
- Resultado: ÉXITO
- Latencia: 44 ms
- Tiempo finalización: 53 ms
- Tiempo permanencia: 113 ms
- Enlaces rotos: 1 de 7
- Porcentaje enlaces rotos: 14%
- Observaciones: Ejecución rápida, rendimiento óptimo

---

### 3. CARRITO DE COMPRAS

**Caso 3.1: Agregar Producto**
- Resultado: ÉXITO
- Latencia: 67 ms
- Tiempo finalización: 175 ms
- Tiempo permanencia: 518 ms
- Enlaces rotos: 1 de 3
- Porcentaje enlaces rotos: 33%
- Observaciones: Ejecución rápida, rendimiento óptimo

**Caso 3.2: Eliminar Producto**
- Resultado: ÉXITO
- Latencia: 90 ms
- Tiempo finalización: 136 ms
- Tiempo permanencia: 240 ms
- Enlaces rotos: 1 de 3
- Porcentaje enlaces rotos: 33%
- Observaciones: Ejecución rápida, rendimiento óptimo

---

### 4. GESTIÓN DE PRODUCTOS

**Caso 4.1: Mostrar Producto**
- Resultado: ÉXITO
- Latencia: 155 ms
- Tiempo finalización: 588 ms
- Tiempo permanencia: 1315 ms
- Enlaces rotos: 1 de 5
- Porcentaje enlaces rotos: 20%
- Observaciones: Ejecución normal, funcionamiento correcto

**Caso 4.2: Buscar Productos**
- Resultado: ÉXITO
- Latencia: 160 ms
- Tiempo finalización: 703 ms
- Tiempo permanencia: 1230 ms
- Enlaces rotos: 0 de 3
- Porcentaje enlaces rotos: 0%
- Observaciones: Ejecución normal, funcionamiento correcto

---

### 5. CATEGORIZACIÓN

**Caso 5.1: Filtrar por Categoría**
- Resultado: ÉXITO
- Latencia: 98 ms
- Tiempo finalización: 230 ms
- Tiempo permanencia: 525 ms
- Enlaces rotos: 0 de 6
- Porcentaje enlaces rotos: 0%
- Observaciones: Ejecución rápida, rendimiento óptimo

---

### 6. ADMINISTRACIÓN DE PRODUCTOS

**Caso 6.1: Cargar Productos Admin**
- Resultado: ÉXITO
- Latencia: 143 ms
- Tiempo finalización: 575 ms
- Tiempo permanencia: 1585 ms
- Enlaces rotos: 0 de 5
- Porcentaje enlaces rotos: 0%
- Observaciones: Ejecución normal, funcionamiento correcto

**Caso 6.2: Crear Producto Admin**
- Resultado: ÉXITO
- Latencia: 242 ms
- Tiempo finalización: 1355 ms
- Tiempo permanencia: 3718 ms
- Enlaces rotos: 1 de 3
- Porcentaje enlaces rotos: 33%
- Observaciones: Ejecución más lenta pero funcional

**Caso 6.3: Actualizar Producto Admin**
- Resultado: ÉXITO
- Latencia: 178 ms
- Tiempo finalización: 729 ms
- Tiempo permanencia: 1716 ms
- Enlaces rotos: 0 de 3
- Porcentaje enlaces rotos: 0%
- Observaciones: Ejecución normal, funcionamiento correcto

**Caso 6.4: Eliminar Producto Admin**
- Resultado: ÉXITO
- Latencia: 114 ms
- Tiempo finalización: 383 ms
- Tiempo permanencia: 649 ms
- Enlaces rotos: 1 de 4
- Porcentaje enlaces rotos: 25%
- Observaciones: Ejecución normal, funcionamiento correcto

---

## RESUMEN GENERAL

### Estadísticas de Pruebas
- **Total de funcionalidades probadas:** 6
- **Total de casos de prueba:** 13
- **Casos exitosos:** 13
- **Casos fallidos:** 0
- **Porcentaje de éxito general:** 100.00%

### Métricas Promedio
- **Latencia promedio:** 129.77 ms
- **Tiempo finalización promedio:** 488.00 ms
- **Tiempo permanencia promedio:** 1139.85 ms
- **Porcentaje total de enlaces rotos:** 13.46%

### Análisis de Performance
- **Latencia:** Excelente (130ms promedio)
- **Estabilidad:** Muy alta (100.0% éxito)
- **Calidad de enlaces:** Aceptable

### Observaciones Técnicas
- Las pruebas se ejecutaron en un entorno controlado usando TestBed de Angular
- Se utilizaron mocks para simular servicios y dependencias externas
- Las métricas de latencia reflejan el tiempo de ejecución de los componentes Angular
- Los datos de enlaces rotos son simulados para propósitos demostrativos

### Recomendaciones
- Mantener cobertura de pruebas actualizada
- Considerar pruebas de integración para flujos completos

---
**Generado automáticamente el 26/8/2025**
**Tiempo total de ejecución: 13 segundos**