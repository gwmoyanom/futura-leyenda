# Refactorización: Sistema de Predicciones Divididas

## Resumen de Cambios

Se ha refactorizado completamente el sistema de predicciones para dividirlo en dos fases principales y agregar soporte para traer resultados de una API externa.

### 🎯 Cambios Principales

#### 1. **Configuración (config.json)**
- ✅ Añadidas fechas del torneo:
  - `tournament.inaugurationDate`: 2026-06-14 (fecha en que se cierran predicciones)
  - `tournament.completionDate`: fecha final del torneo
  - `tournament.groupPhaseEndDate`: fin de grupos
  - `tournament.knockoutPhaseStartDate`: inicio de llave final
- ✅ Configuración de API:
  - Provider: football-data.org
  - Competition code: WC (World Cup)

#### 2. **Datos de Partidos (matches.json)**
- ✅ Añadido campo `phase` a cada partido:
  - `group`: Partidos de fase de grupos
  - `round16`: Octavos de final
  - `quarterfinal`: Cuartos de final
  - `semifinal`: Semifinales
  - `final`: Final
- ✅ Estructura completa con ejemplos de cada fase

#### 3. **Nuevo Servicio de API (matches-api.service.js)**
```javascript
// Funcionalidades:
- fetchMatchesFromAPI()      // Obtiene partidos de football-data.org
- getMergedMatches()         // Combina datos locales con API
- updateMatchResult()        // Actualiza resultados locales
- clearMatchesCache()        // Limpia cache

// Caching:
- Cache en localStorage por 5 minutos
- Fallback a datos locales si la API falla
```

#### 4. **Store Zustand Actualizado (store/index.js)**
Nuevos métodos:
- `isPredictionLocked()`: Verifica si las predicciones están cerradas
- `getMatchesByPhase(phase)`: Filtra partidos por fase
- `getPredictionsByPhase(phase)`: Obtiene predicciones de una fase
- `getMyScoreByPhase(phase)`: Calcula puntos por fase

#### 5. **Utilidades de Fechas (date.utils.js)**
Nuevas funciones:
```javascript
isAllPredictionsLocked(inaugDate)    // ¿Se cerraron todas las predicciones?
getPredictionsLockCountdown(inaugDate) // Cuenta atrás hasta cierre
isPhaseCompleted(phaseMatches)       // ¿Terminó esta fase?
getHoursUntilKickoff(kickoff)        // Horas hasta saque inicial
```

#### 6. **PredictionsPage Refactorizada**
- ✅ Sistema de pestañas (tabs) para cada fase:
  - FASE DE GRUPOS
  - OCTAVOS DE FINAL
  - CUARTOS DE FINAL
  - SEMIFINALES
  - FINAL

- ✅ Indicadores visuales:
  - ⏰ Cuenta atrás hasta cierre de predicciones
  - 🔒 Banner cuando están cerradas
  - Puntos por fase separados

- ✅ Modo read-only después de inauguración:
  - Usuarios ven sus predicciones cerradas
  - No pueden hacer cambios
  - Pueden ver resultados finales

### 📋 Flujo de Usuario

#### Antes de la Inauguración (antes de 14 de junio)
```
1. Usuario entra a /predictions
2. Ve dos pestañas: GRUPOS y LLAVE FINAL
3. Selecciona una pestaña
4. Ve partidos agrupados por fecha
5. Ingresa sus predicciones
6. Puede editar sus predicciones hasta el último momento
7. Ve countdown: "2d 4h para cierre"
```

#### Después de la Inauguración (después de 14 de junio)
```
1. Usuario entra a /predictions
2. Ve ambas pestañas (GRUPOS está completa)
3. La LLAVE FINAL está disponible
4. Modo read-only: ve sus predicciones pero no puede editar
5. Ve "🔒 Predicciones Cerradas"
6. Puede ver puntos obtenidos en cada partido
```

### 🔌 Integración con API (Football-Data.org)

El servicio `matches-api.service.js` está preparado para conectarse con football-data.org:

```javascript
// En el futuro, en storage.service.js:
import { fetchMatchesFromAPI, getMergedMatches } from '@/services/matches-api.service.js'

export async function getMatches() {
  const base = await fetchJson('matches.json')
  const apiMatches = await fetchMatchesFromAPI('WC')
  return getMergedMatches(base, apiMatches)
}
```

**Próximos pasos:**
1. Obtener API key de football-data.org
2. Agregar variable de entorno: `VITE_FOOTBALL_DATA_API_KEY`
3. Descomentar header de autenticación en `matches-api.service.js`

### 🧪 Testing

Para verificar el funcionamiento:

```bash
# 1. Verificar que no hay errores de sintaxis
npm run build

# 2. Ejecutar en desarrollo
npm run dev

# 3. Navegar a /predictions como usuario logueado

# 4. Verificar:
- ✓ Se muestran tabs de fases
- ✓ Puedes cambiar entre pestañas
- ✓ Las predicciones se guardan
- ✓ Aparece countdown de cierre
- ✓ Cambio de modo read-only después de 14-junio
```

### 📦 Cambios por Archivo

| Archivo | Cambios |
|---------|---------|
| `config.json` | ✅ Añadidas fechas y config de API |
| `matches.json` | ✅ Añadido campo `phase` a todos |
| `store/index.js` | ✅ 5 nuevos métodos para filtrado por fase |
| `utils/date.utils.js` | ✅ 4 nuevas funciones para lock logic |
| `pages/participant/PredictionsPage.jsx` | ✅ Reescrito con tabs y lógica de fases |
| `services/matches-api.service.js` | ✅ NUEVO archivo para integración API |

### ⚠️ Notas Importantes

1. **Fecha de Cierre**: Las predicciones se cierran automáticamente a las 16:00 UTC del 14 de junio
   - Configurable en `config.json` > `tournament.inaugurationDate`

2. **API Rate Limiting**: Football-data.org tiene límites de requests
   - Implementamos cache de 5 minutos
   - Para producción, considerar backend proxy

3. **Fase de Grupos vs Llave Final**:
   - Grupos incluyen: todos con `phase: "group"`
   - Llave final incluye: `round16`, `quarterfinal`, `semifinal`, `final`

4. **Fallback Local**: Si la API falla, usa datos de `matches.json`
   - Útil para desarrollo offline
   - Cache en localStorage

### 🚀 Próximos Pasos Recomendados

1. [ ] Conectar con API real de football-data.org
2. [ ] Crear página de admin para sincronizar resultados
3. [ ] Agregar notificaciones cuando cambian resultados
4. [ ] Implementar sistema de "live updates"
5. [ ] Testing exhaustivo de todas las fases
6. [ ] Documentar API de terceros para mantenedores

---

**Última actualización**: 2026-06-10
**Versión**: 2.0.0 (Two-Phase Predictions)
