# 🚀 Gu\u00eda de Despliegue R\u00e1pido

## Opci\u00f3n 1: Replicate (Tu API Key)

### Paso 1: Obt\u00e9n tu API Token de Replicate
1. Ve a https://replicate.com
2. Crea una cuenta / Inicia sesi\u00f3n
3. Ve a **Account Settings** \u2192 **API Tokens**
4. Copia tu token (empieza con `r8_...`)

### Paso 2: Despliega en Vercel
```bash
# Opci\u00f3n A: Desde la terminal
npm install -g vercel
cd story-illustrator
vercel
```

**Opci\u00f3n B: Desde GitHub**
1. Sube el proyecto a un repositorio de GitHub
2. Ve a https://vercel.com
3. Click en "Add New Project"
4. Importa tu repositorio
5. Click en "Deploy"

### Paso 3: Configura la Variable de Entorno
1. En Vercel Dashboard, ve a tu proyecto
2. Click en **Settings** \u2192 **Environment Variables**
3. Agrega:
   - **Name**: `REPLICATE_API_TOKEN`
   - **Value**: Tu token de Replicate
   - **Environment**: Production, Preview, Development (todos)
4. Click en **Save**

### Paso 4: Redespliega (si ya hab\u00edas desplegado)
```bash
vercel --prod
```

\u00a1Listo! Tu app estar\u00e1 disponible en la URL que te proporcione Vercel.

---

## Opci\u00f3n 2: FAL.AI (Alternativa Gratuita)

### Paso 1: Obt\u00e9n tu API Key de FAL.AI
1. Ve a https://fal.ai/dashboard/keys
2. Crea una cuenta / Inicia sesi\u00f3n
3. Copia tu API key

### Paso 2: Cambia el Archivo de la API
```bash
cd story-illustrator/api
mv generate-image.js generate-image-replicate.js
mv generate-image-fal.js generate-image.js
```

### Paso 3: Despliega en Vercel
```bash
vercel
```

### Paso 4: Configura la Variable de Entorno
1. En Vercel Dashboard, ve a tu proyecto
2. Click en **Settings** \u2192 **Environment Variables**
3. Agrega:
   - **Name**: `FAL_KEY`
   - **Value**: Tu API key de FAL.AI
   - **Environment**: Production, Preview, Development (todos)
4. Click en **Save**

### Paso 5: Redespliega
```bash
vercel --prod
```

---

## Prueba Local (Opcional)

```bash
# Instala Vercel CLI
npm install -g vercel

# Crea archivo .env en la ra\u00edz del proyecto
echo "REPLICATE_API_TOKEN=tu_token" > .env
# O para FAL.AI:
echo "FAL_KEY=tu_key" > .env

# Ejecuta localmente
vercel dev

# Abre en navegador
# http://localhost:3000
```

---

## \u00bfQu\u00e9 API usar?

| Caracter\u00edstica | Replicate | FAL.AI |
|----------------|-----------|---------|
| **Costo** | ~$0.003 por imagen | Gratis (con l\u00edmites) |
| **Calidad** | Excelente | Muy buena |
| **Velocidad** | 5-10 seg | 10-20 seg |
| **L\u00edmite** | Seg\u00fan cr\u00e9ditos | ~100 img/mes |
| **Mejor para** | Producci\u00f3n | Testing |

---

## Verificaci\u00f3n

Despu\u00e9s del despliegue, verifica:

1. \u2705 La p\u00e1gina carga correctamente
2. \u2705 El textarea acepta texto
3. \u2705 El selector de estilos funciona
4. \u2705 Al hacer click en "Generar ilustraci\u00f3n":
   - Aparece el estado de carga
   - Se genera la imagen
   - Se puede descargar
5. \u2705 La galer\u00eda muestra im\u00e1genes de ejemplo

---

## Problemas Comunes

### "API key not configured"
- Verifica que agregaste la variable de entorno correcta
- Redespliega con `vercel --prod`

### "CORS Error"
- Ya est\u00e1 configurado, no deber\u00eda pasar
- Si persiste, verifica que uses `/api/generate-image`

### "Rate limit exceeded"
- Replicate: Agrega cr\u00e9ditos en tu cuenta
- FAL.AI: Espera o upgradea tu plan

### La imagen no se genera
- Verifica que el prompt tenga m\u00e1s de 10 caracteres
- Revisa logs en Vercel Dashboard \u2192 Functions \u2192 Logs

---

## URLs \u00datiles

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Replicate Dashboard**: https://replicate.com/account
- **FAL.AI Dashboard**: https://fal.ai/dashboard
- **Documentaci\u00f3n Vercel**: https://vercel.com/docs
- **Documentaci\u00f3n Replicate API**: https://replicate.com/docs
- **Documentaci\u00f3n FAL.AI**: https://fal.ai/docs

---

**\u00a1Eso es todo! Tu aplicaci\u00f3n deber\u00eda estar funcionando. \ud83c\udf89**
