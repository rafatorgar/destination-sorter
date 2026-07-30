/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Export estático: la app entera es HTML, CSS y JS servidos como ficheros.
   *
   * Ya no queda nada que ejecutar en un servidor —el Excel se lee en el
   * navegador, los municipios salen de un JSON y las distancias las da Valhalla
   * directamente desde el cliente—, así que Cloudflare Pages puede servirlo todo
   * gratis y Railway sobra.
   */
  output: "export",

  /**
   * El optimizador de imágenes de Next necesita un servidor, y en export no lo
   * hay. Las del proyecto son un par de assets estáticos, así que se sirven tal
   * cual.
   */
  images: { unoptimized: true },

  /**
   * Cloudflare Pages sirve `/ruta/` como `/ruta/index.html`. Con esto los enlaces
   * internos coinciden con los ficheros generados y entrar directamente a
   * `/blog/lo-que-sea` no provoca una redirección.
   */
  trailingSlash: true,
};

export default nextConfig;
