import './style.css';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { format } from 'https://cdn.jsdelivr.net/npm/date-fns@2.29.3/esm/index.js';

const SUPABASE_URL = 'https://gsueyizspotlqnoggtqv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzdWV5aXpzcG90bHFub2dndHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MDQ3MTgsImV4cCI6MjA2NDM4MDcxOH0.G_nplcESzzY2eYkPuDqf6TcgmKsWpE3J9q1RLrkG9Rc';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const articlesList = document.getElementById('articles-list');
const newArticleForm = document.getElementById('new-article-form');
const sortArticlesSelect = document.getElementById('sort-articles');
const loadingIndicator = document.getElementById('loading-indicator');

async function fetchArticles() {
    loadingIndicator.style.display = 'block';
    articlesList.innerHTML = '';

    const [sortBy, order] = sortArticlesSelect.value.split('.');

    try {
        const { data, error } = await supabase
            .from('article')
            .select('*')
            .order(sortBy, { ascending: order === 'asc' });

        if (error) {
            console.error('Błąd pobierania artykułów:', error.message);
            return;
        }

        if (data.length === 0) {
            articlesList.innerHTML = '<p class="text-center text-gray-500">Brak artykułów do wyświetlenia.</p>';
            return;
        }

        data.forEach(article => {
            const articleDiv = document.createElement('div');
            articleDiv.className = 'bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200';
            const formattedDate = format(new Date(article.created_at), 'dd-MM-yyyy');

            articleDiv.innerHTML = `
                <h3 class="text-xl font-bold mb-2 text-gray-800">${article.title}</h3>
                ${article.subtitle ? `<p class="text-gray-600 mb-2 italic">${article.subtitle}</p>` : ''}
                <p class="text-sm text-gray-500 mb-2">Autor: <span class="font-medium">${article.author}</span> | Data: <span class="font-medium">${formattedDate}</span></p>
                <hr class="my-3 border-gray-200">
                <p class="text-gray-700 leading-relaxed">${article.content}</p>
            `;
            articlesList.appendChild(articleDiv);
        });

    } catch (err) {
        console.error('Wystąpił nieoczekiwany błąd:', err.message);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

async function createArticle(event) {
    event.preventDefault();

    const title = newArticleForm.title.value.trim();
    const subtitle = newArticleForm.subtitle.value.trim();
    const author = newArticleForm.author.value.trim();
    const content = newArticleForm.content.value.trim();
    let createdAtInput = newArticleForm.created_at?.value;

    let createdAt = createdAtInput ? new Date(createdAtInput).toISOString() : new Date().toISOString();

    if (!title || !author || !content) {
        console.error('Proszę wypełnić wszystkie wymagane pola: Tytuł, Autor, Treść.');
        return;
    }

    try {
        const { data, error } = await supabase
            .from('article')
            .insert([{ title, subtitle, author, content, created_at: createdAt }]);

        if (error) {
            console.error('Błąd dodawania artykułu:', error.message);
            return;
        }

        console.log('Artykuł został pomyślnie dodany!');
        alert('Artykuł został dodany!');
        newArticleForm.reset();
        fetchArticles();

    } catch (err) {
        console.error('Wystąpił nieoczekiwany błąd:', err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchArticles();
});

newArticleForm.addEventListener('submit', createArticle);
sortArticlesSelect.addEventListener('change', fetchArticles);
