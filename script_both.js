// script.js

// Selecionando os containers para os posts
const postsContainerSubstack = document.getElementById('postsContainerSubstack');
const postsContainerDevto = document.getElementById('postsContainerDevto');

// Feed RSS do Substack
const rssFeedUrl = 'https://darioprazeres.substack.com/feed';
const proxyUrl = 'https://api.allorigins.win/get?url=';

// API do dev.to
const devToApiUrl = 'https://dev.to/api/articles?username=darioprazeres'; // Substitua pelo seu username no dev.to

// Função para carregar posts do Substack
function loadSubstackRSS() {
    fetch(proxyUrl + encodeURIComponent(rssFeedUrl))
        .then(response => response.json())
        .then(data => {
            const xmlData = data.contents;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
            const items = xmlDoc.getElementsByTagName('item');

            for (let i = 0; i < items.length; i++) {
                const title = items[i].getElementsByTagName('title')[0].textContent;
                const link = items[i].getElementsByTagName('link')[0].textContent;
                const description = items[i].getElementsByTagName('description')[0].textContent;

                const postHTML = `
                    <div class="post">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <a href="${link}" target="_blank">Leia mais</a>
                    </div>
                `;
                postsContainerSubstack.innerHTML += postHTML;
            }
        })
        .catch(err => console.error('Erro ao carregar o feed RSS do Substack:', err));
}

// Função para carregar posts do dev.to
function loadDevtoPosts() {
    fetch(devToApiUrl)
        .then(response => response.json())
        .then(posts => {
            posts.forEach(post => {
                const title = post.title;
                const link = post.url;
                const description = post.description || 'Sem descrição disponível';

                const postHTML = `
                    <div class="post">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        <a href="${link}" target="_blank">Leia mais</a>
                    </div>
                `;
                postsContainerDevto.innerHTML += postHTML;
            });
        })
        .catch(err => console.error('Erro ao carregar os posts do dev.to:', err));
}

// Função para validar o e-mail e redirecionar para o Substack
function subscribeNewsletter(event) {
    event.preventDefault(); // Impede o envio do formulário

    const emailInput = document.querySelector('input[name="email"]');
    const email = emailInput.value.trim();

    // Validação simples do e-mail
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (emailRegex.test(email)) {
        // Se o e-mail for válido, redireciona para o Substack
        window.open(`https://darioprazeres.substack.com`, '_blank'); // Substitua pelo seu link Substack
        emailInput.value = ''; // Limpa o campo após o envio
        alert('Inscrição realizada com sucesso!'); // Mensagem de confirmação
    } else {
        alert('Por favor, insira um e-mail válido.'); // Mensagem de erro
    }
}

// Carregar os posts assim que a página for carregada
window.onload = () => {
    loadSubstackRSS();
    loadDevtoPosts();

    // Adicionando o evento para o formulário de inscrição
    const newsletterForm = document.querySelector('form');
    newsletterForm.addEventListener('submit', subscribeNewsletter);
};
