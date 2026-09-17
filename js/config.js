/* Configuração do back-end de sincronização.
   - Vazio ("") = mesmo endereço do site (quando o próprio servidor Node serve a loja).
   - Preenchido = endereço do servidor Node hospedado à parte (ex.: Render).
   Exemplo: window.TE_API = "https://te-variedades.onrender.com";
*/
window.TE_API = "https://te-variedades.onrender.com";

/* Token de gravação (opcional).
   Deve ser IGUAL ao que estiver em API_TOKEN ao iniciar o servidor.
   Se deixar vazio, as gravações ficam liberadas (uso apenas local/Wi-Fi). */
window.TE_API_TOKEN = "";
