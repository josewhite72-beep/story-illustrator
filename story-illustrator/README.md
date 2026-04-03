# Story-illustrator 🎨✨

Transforma tus palabras en arte visual con inteligencia artificial.

## Características

- 📝 **Entrada de texto**: Escribe tu historia o descripción (hasta 500 caracteres)
- 🎨 **Múltiples estilos**: Elige entre 7 estilos diferentes de ilustración:
  - Acuarela
  - Arte Conceptual
  - Boceto Vintage
  - Cyberpunk
  - Estilo Ghibli
  - Óleo
  - Arte Digital
- 🖼️ **Generación de imágenes**: Usa IA para crear ilustraciones únicas
- 💾 **Descarga**: Guarda tus ilustraciones como PNG
- 🖼️ **Galería**: Visualiza tu historial de imágenes generadas
- 🔄 **Reintentos automáticos**: Manejo robusto de errores
- 🌙 **Diseño premium**: Interfaz oscura y elegante con efectos glassmórficos

## Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Vercel Serverless Functions
- **APIs de IA**:
  - Replicate (flux-schnell) - Opción principal
  - FAL.AI (flux/dev) - Alternativa gratuita
- **Diseño**: Glassmorphism, animaciones CSS
- **Fuentes**: Cormorant Garamond, Outfit
- **Iconos**: Lucide Icons

## Estructura del proyecto

```
story-illustrator/
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Lógica del frontend
├── vercel.json             # Configuración de Vercel
├── api/
│   ├── generate-image.js     # Función serverless para Replicate
│   └── generate-image-fal.js # Función serverless para FAL.AI (alternativa)
└── README.md               # Este archivo
```

## Instalación y Despliegue en Vercel

### Opción 1: Usando Replicate API

1. **Obtén tu API key de Replicate**:
   - Ve a [replicate.com](https://replicate.com)
   - Crea una cuenta o inicia sesión
   - Ve a tu perfil → API tokens
   - Copia tu API token

2. **Despliega en Vercel**:
   ```bash
   # Instala Vercel CLI (si no lo tienes)
   npm install -g vercel
   
   # Navega a la carpeta del proyecto
   cd story-illustrator
   
   # Despliega
   vercel
   ```

3. **Configura las variables de entorno en Vercel**:
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega:
     - Name: `REPLICATE_API_TOKEN`
     - Value: Tu API token de Replicate
   - Save

4. **Redespliega** (si es necesario):
   ```bash
   vercel --prod
   ```

### Opción 2: Usando FAL.AI (Alternativa Gratuita)

1. **Obtén tu API key de FAL.AI**:
   - Ve a [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys)
   - Crea una cuenta o inicia sesión
   - Copia tu API key

2. **Cambia el archivo de la función**:
   ```bash
   # Renombra el archivo original
   mv api/generate-image.js api/generate-image-replicate.js
   
   # Usa la versión de FAL.AI
   mv api/generate-image-fal.js api/generate-image.js
   ```

3. **Despliega en Vercel**:
   ```bash
   vercel
   ```

4. **Configura las variables de entorno en Vercel**:
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega:
     - Name: `FAL_KEY`
     - Value: Tu API key de FAL.AI
   - Save

5. **Redespliega**:
   ```bash
   vercel --prod
   ```

### Opción 3: Deploy con un Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/story-illustrator)

1. Haz clic en el botón "Deploy with Vercel"
2. Conecta tu cuenta de GitHub
3. Agrega las variables de entorno:
   - `REPLICATE_API_TOKEN` (para Replicate)
   - o `FAL_KEY` (para FAL.AI)
4. Deploy

## Desarrollo Local

Para probar localmente con Vercel Dev:

```bash
# Instala Vercel CLI
npm install -g vercel

# Crea archivo .env con tus keys
echo "REPLICATE_API_TOKEN=tu_token_aqui" > .env
# o
echo "FAL_KEY=tu_key_aqui" > .env

# Ejecuta el servidor de desarrollo
vercel dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

1. **Escribe tu historia**: Ingresa una descripción o historia en el área de texto (máximo 500 caracteres)
2. **Selecciona un estilo**: Elige el estilo de ilustración que prefieres
3. **Genera**: Haz clic en "Generar ilustración"
4. **Espera**: La IA creará tu ilustración (puede tomar 10-30 segundos)
5. **Descarga**: Una vez generada, puedes descargarla como PNG
6. **Explora la galería**: Tus últimas 6 imágenes se guardan automáticamente

## Comparación de APIs

| Característica | Replicate (flux-schnell) | FAL.AI (flux/dev) |
|----------------|--------------------------|-------------------|
| Costo | Pago por uso (~$0.003/img) | Créditos gratis | Calidad | Excelente | Muy buena |
| Velocidad | 5-10 segundos | 10-20 segundos |
| Límite de uso | Según créditos | ~100 imágenes gratis/mes |
| Recomendado para | Producción | Desarrollo/Testing |

## Personalización

### Cambiar colores

Edita las variables CSS en `styles.css`:

```css
/* Cambia los colores principales */
--primary: #F5A623;  /* Color principal (amber) */
--background: #05050A;  /* Fondo oscuro */
```

### Agregar más estilos

Edita `script.js` para agregar nuevos estilos:

```javascript
const stylePrompts = {
    'tu-estilo': 'descripción del estilo en el prompt',
    // ...
};
```

Y agrega la opción en `index.html`:

```html
<option value="tu-estilo">Tu Estilo</option>
```

### Cambiar modelo de IA

Para usar otro modelo de Replicate, edita `api/generate-image.js`:

```javascript
version: 'nuevo-hash-de-version',  // Cambia el hash
```

## Solución de Problemas

### Error: "API key not configured"
- Verifica que agregaste la variable de entorno correcta en Vercel
- Asegúrate de haber redeployado después de agregar la variable

### Error: "CORS"
- Las funciones serverless ya incluyen headers CORS
- Si persiste, verifica que estés usando la ruta `/api/generate-image`

### Imagen no se genera
- Verifica que tu prompt tenga al menos 10 caracteres
- Revisa los logs en Vercel Dashboard → Functions
- Verifica que tengas créditos en tu cuenta de Replicate/FAL.AI

### La descarga no funciona
- Algunos navegadores bloquean descargas automáticas
- Verifica los permisos del navegador
- Intenta hacer clic derecho → "Guardar imagen como"

## Seguridad

- ✅ Las API keys se almacenan de forma segura como variables de entorno
- ✅ Las keys nunca se exponen en el frontend
- ✅ Las funciones serverless actúan como proxy seguro
- ✅ CORS configurado correctamente

## Próximas Mejoras

- [ ] Autenticación de usuarios
- [ ] Galería persistente en base de datos
- [ ] Compartir imágenes en redes sociales
- [ ] Edición básica de imágenes
- [ ] Múltiples idiomas
- [ ] Modo claro/oscuro
- [ ] Generación en batch

## Licencia

MIT License - Siéntete libre de usar este proyecto como desees.

## Soporte

Si tienes problemas o preguntas:
1. Revisa la sección de Solución de Problemas
2. Consulta la documentación de [Vercel](https://vercel.com/docs)
3. Consulta la documentación de [Replicate](https://replicate.com/docs) o [FAL.AI](https://fal.ai/docs)

---

**¡Disfruta creando arte con IA! 🎨✨**