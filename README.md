# ValorMóvil (PhoneValue)

App en español que estima **cuánto del hardware y las funciones de tu móvil aprovechas de verdad** — en % y en euros — y recomienda alternativas más baratas que encajan con tu uso real.

Hay **dos caminos**:

| Camino | Qué mide | Cómo instalar |
|--------|----------|---------------|
| **PWA (GitHub Pages)** | Datos demo / sintéticos | Añadir a pantalla de inicio |
| **APK Android (Capacitor)** | `UsageStats` real + almacenamiento / batería / red | Descargar artefacto de Actions |

> Privacidad: el listado de apps y tiempos de uso **se queda en el dispositivo**. No se sube a ningún servidor.

## Cómo ejecutar (web)

```bash
npm install
npm run dev
```

Abre la URL que muestre Vite (normalmente `http://localhost:5173`).

Otros comandos:

```bash
npm test              # tests del motor (Vitest)
npm run build         # build web / PWA (base /phonevalue/ para GitHub Pages)
npm run preview       # previsualizar el build
npm run build:android # build web para Capacitor (base /) + cap sync
```

## App Android nativa (APK)

El proyecto incluye Capacitor + un plugin Kotlin (`PhoneUsage`) que:

- comprueba si el permiso **Acceso al uso** (`PACKAGE_USAGE_STATS`) está concedido
- abre la pantalla de ajustes del sistema para concederlo
- consulta `UsageStats` (ventana ~30 días) y agrega tiempo en primer plano por paquete + cobertura (`X días de historial`)
- lee almacenamiento total/libre y señales básicas de batería / red
- alimenta el motor %/€ existente; las categorías se marcan **medido** vs **estimado**

### Activar el workflow de Actions (una vez)

El YAML listo está en `docs/android-apk.workflow.yml`. Hay que publicarlo como workflow (el token OAuth de este entorno no tiene scope `workflow`):

```bash
mkdir -p .github/workflows
cp docs/android-apk.workflow.yml .github/workflows/android-apk.yml
git add .github/workflows/android-apk.yml
git commit -m "ci: Android APK workflow"
git push
```

(Con `gh auth refresh -s workflow` también se puede empujar desde CI/bots.)

### Descargar e instalar el APK

1. Abre las Actions: https://github.com/JohnKeppler/phonevalue/actions  
   (tras publicar el workflow: `…/actions/workflows/android-apk.yml`)  
2. Entra en la ejecución más reciente (o **Run workflow**).  
3. Descarga el artefacto **`app-debug`** → dentro está `app-debug.apk`.  
4. Copia el APK al móvil.  
5. En Android: **Ajustes → Seguridad** (o Apps) → permite **instalar apps desconocidas** para el explorador/Archivos.  
6. Instala `app-debug.apk` y ábrelo.  
7. En ValorMóvil pulsa **Abrir ajustes de Acceso al uso**, activa el interruptor de ValorMóvil, vuelve y pulsa **Leer datos del teléfono**.  
8. Revisa el dashboard: badges **medido** / **estimado** y la nota de confianza según los días de historial.

> Solo Android. En el navegador el botón nativo no aparece; queda el perfil demo / sintético.

### Build local del APK (opcional)

Requiere JDK 17+ y Android SDK:

```bash
npm ci
npm run build:android
cd android && ./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Qué incluye (UI)

1. **Onboarding** — precio, presupuesto, tipo de uso; en Android: **Leer datos del teléfono**; fallback demo.  
2. **Dashboard** — S%, € aprovechados/desperdiciados, 10 categorías con badges.  
3. **Detalle de categoría** — modal con nota de cálculo.  
4. **Recomendaciones** — top 3 del catálogo local.  
5. **Transparencia** — medido vs demo / estimado.

## Motor

Pesos (suman 100 %):

| Categoría        | Peso |
|------------------|------|
| SoC              | 16   |
| Pantalla         | 18   |
| Cámara           | 18   |
| Almacenamiento   | 8    |
| RAM              | 8    |
| Batería + carga  | 12   |
| Conectividad     | 6    |
| Audio            | 4    |
| Sensores y pagos | 5    |
| Software / marca | 5    |

Fórmulas:

- `€_asignados = P × w/100`
- `€_aprov = asignados × u/100`
- `desperdicio = asignados − aprov`
- `S = 100 × Σ aprov / P`

Perfil demo `P = 1000 €` → ~**310 €** aprovechados / ~**690 €** desperdiciados / ~**31 %**.

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS v4
- Vitest
- Capacitor 7 (Android) + plugin Kotlin local `PhoneUsage`
- GitHub Actions → artefacto `app-debug.apk`

## Estructura clave

```
src/
  engine/          # cálculo, pesos, recomendación, mapUsage
  data/            # perfil demo + catálogo
  components/      # UI en español
  native/          # bridge Capacitor → PhoneUsage
android/
  app/.../plugins/PhoneUsagePlugin.kt
.github/workflows/android-apk.yml
```

## Instalar como PWA (GitHub Pages)

La demo en GitHub Pages sigue siendo una **PWA** instalable (datos demo):

1. Abre en Chrome: https://johnkeppler.github.io/phonevalue/
2. Menú (⋮) → **Instalar app** o **Añadir a pantalla de inicio**
3. Confirma. ValorMóvil se abrirá en modo pantalla completa (standalone).

> El build de Pages usa `npm run build` (base `/phonevalue/`). El APK usa `npm run build:android` (base `/`). Ambos conviven.

## Licencia

Prototipo privado — uso interno / demo.
