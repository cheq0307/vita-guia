# API movil Vita Guia v1

La API es compartida por Android e iOS. No contiene logica exclusiva de una plataforma y todas las respuestas usan JSON.

## Direcciones locales

- Navegador en la PC: `http://127.0.0.1:8082/api/v1`
- Emulador Android: `http://10.0.2.2:8082/api/v1`
- Telefono Android fisico: `http://IP-LAN-DE-LA-PC:8082/api/v1`
- Produccion: siempre debe usar HTTPS.

En Android, permite trafico HTTP solamente en la configuracion de depuracion. No habilites texto claro en la version publicada.

## Flujo de acceso

1. La app genera un UUID al instalarse y lo conserva en DataStore.
2. Recibe el token desde el enlace compartido por el asesor.
3. Envia token, UUID, plataforma y version a `POST /access/open`.
4. Guarda `access_token` usando Android Keystore. En iOS se guardara en Keychain.
5. Envia `Authorization: Bearer ACCESS_TOKEN` en las demas peticiones.
6. La misma instalacion puede volver a abrir la guia sin consumir otra apertura.
7. Una instalacion nueva consume una apertura del enlace.

El Bearer deja de funcionar cuando el enlace vence o es revocado.

## Endpoints

### POST /access/open

Peticion:

~~~json
{
  "token": "TOKEN-DEL-ENLACE",
  "client_id": "uuid-persistente-de-la-instalacion",
  "platform": "android",
  "app_version": "1.0.0"
}
~~~

Respuesta `200`:

~~~json
{
  "data": {
    "access_token": "TOKEN-BEARER",
    "token_type": "Bearer",
    "expires_at": "2026-08-28T10:00:00-06:00",
    "platform": "android",
    "guide_path": "/api/v1/guide",
    "client": {
      "name": "Cliente",
      "advisor_name": "Asesor"
    }
  }
}
~~~

Puede responder `404` si el enlace no existe y `410` si vencio, fue revocado o alcanzo su limite.

### GET /guide

Requiere Bearer. Devuelve cliente, vencimiento, temas y cuatro modulos:

- `products`
- `instructions`
- `videos`
- `stories`

Cada elemento incluye `type`, `topic`, texto y recursos. Los recursos locales incluyen una URL protegida; YouTube y otros enlaces incluyen `external_url`.

### POST /chat

Requiere Bearer.

~~~json
{
  "question": "Como se utiliza?",
  "scope": "health"
}
~~~

`scope` acepta `all`, `health`, `business` y `mixed`. Salud y Negocios también incluyen las fuentes Mixtas. La respuesta sigue siendo extractiva y solo usa publicaciones activas.

### GET /assets/{id}

Requiere Bearer. Entrega PDF, imagenes o videos privados. El encabezado Authorization tambien debe enviarse al descargar o reproducir el archivo.

## Retrofit para Android

~~~kotlin
interface VitaApi {
    @POST("access/open")
    suspend fun open(@Body request: OpenAccessRequest): OpenAccessResponse

    @GET("guide")
    suspend fun guide(@Header("Authorization") bearer: String): GuideResponse

    @POST("chat")
    suspend fun chat(
        @Header("Authorization") bearer: String,
        @Body request: ChatRequest
    ): ChatResponse

    @Streaming
    @GET("assets/{id}")
    suspend fun asset(
        @Header("Authorization") bearer: String,
        @Path("id") id: Long
    ): ResponseBody
}

data class OpenAccessRequest(
    val token: String,
    @SerializedName("client_id") val clientId: String,
    val platform: String = "android",
    @SerializedName("app_version") val appVersion: String
)
~~~

Configura Retrofit con `http://10.0.2.2:8082/api/v1/` en el emulador. En produccion cambia solo la URL base; el contrato no cambia.

## Preparacion para iOS

iOS enviara `platform: ios`, usara URLSession o Alamofire y modelos Codable. El token debe almacenarse en Keychain. La API, los modulos, los temas y las rutas de recursos son los mismos; no se necesita otro backend.
