# 📈 Steam Trade Dashboard

Una herramienta web moderna diseñada para calcular y analizar la rentabilidad de conversión de **Pesos Argentinos (ARP)** a **TF2 Keys** a través de la compra de juegos en Steam.

🔗 **[Ver Demo en Vivo](https://cesarduq.github.io/steam-trade-dashboard/)**
*(Nota: El enlace funcionará una vez actives GitHub Pages)*

![Preview](https://via.placeholder.com/800x400?text=Vista+Previa+del+Dashboard)
*(Puedes reemplazar este link con una captura real de tu dashboard más adelante)*

## ✨ Características

*   **⚡ Cálculos en Tiempo Real:** Modifica el precio de la Key o los costos y toda la tabla se actualiza instantáneamente sin recargar.
*   **💾 Persistencia de Datos:** Usa `LocalStorage` para guardar tus juegos, precios y configuración automáticamente. Si cierras el navegador, tus datos seguirán ahí al volver.
*   **🌗 Modo Oscuro/Claro:** Interfaz moderna con estilos "Glassmorphism" y degradados, adaptable a tu preferencia visual.
*   **📊 Historial de Snapshots:** Guarda registros de tus análisis para comparar precios y oportunidades de días anteriores.
*   **📱 Diseño Responsivo:** Funciona perfectamente en PC y en dispositivos móviles gracias a Bootstrap 5.

## 🧮 Cómo funciona el cálculo

La herramienta busca el menor costo de ARP por cada dólar neto obtenido en Steam.

1.  **Ingreso Bruto:** `Cantidad de Keys` × `Precio Key en Steam`.
2.  **Ingreso Neto (Steam):** Se descuenta el **13.04%** de comisión de Steam (Factor neto: `0.8696`).
3.  **Ratio (ARP/1$):**
    ```math
    Ratio = Costo ARP / (Ingreso Neto)
    ```
    *   🟢 **Verde:** La opción más rentable (menor costo por dólar).
    *   🔴 **Rojo:** La opción menos rentable.

## 🚀 Tecnologías Usadas

*   **HTML5 & CSS3** (Variables CSS, Flexbox, Grid)
*   **JavaScript** (Vanilla JS, LocalStorage API)
*   **Bootstrap 5.3** (Framework UI)
*   **FontAwesome** (Iconos)

## 🛠️ Instalación / Uso Local

No requieres instalar nada. Solo necesitas un navegador web.

1.  Clona el repositorio o descarga el archivo `.zip`.
2.  Abre el archivo `index.html` en tu navegador (Chrome, Edge, Firefox).

## 📄 Licencia

Este proyecto es de uso libre. Siéntete libre de modificarlo para tus propias necesidades de trade.
