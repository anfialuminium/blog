// Function to fetch posts from Supabase
async function getPosts() {
    try {
        const { data, error } = await supabaseClient
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Fallback to local storage if supabase fails
        const posts = localStorage.getItem('anfi_blog_posts');
        return posts ? JSON.parse(posts) : [];
    }
}

// Function to render posts on the index page
async function renderPosts() {
    const postsContainer = document.getElementById('blog-posts');
    const noPostsContainer = document.getElementById('no-posts');
    
    // Show loading state if needed
    postsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">טוען פוסטים...</div>';

    const posts = await getPosts();

    if (posts.length === 0) {
        postsContainer.style.display = 'none';
        noPostsContainer.style.display = 'block';
        return;
    }

    postsContainer.style.display = 'grid';
    noPostsContainer.style.display = 'none';
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'card';
        
        const dateFormatted = new Date(post.created_at).toLocaleDateString('he-IL');
        
        postElement.innerHTML = `
            ${post.image_url ? `<div class="card-img" style="background-image: url('${post.image_url}')"></div>` : ''}
            <div class="card-content">
                <div class="post-meta">
                    <span>${dateFormatted}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${truncateText(post.content, 120)}</p>
                <a href="post.html?id=${post.id}" class="btn btn-small">קרא עוד</a>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function truncateText(text, length) {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
}

// Initialize
document.addEventListener('DOMContentLoaded', renderPosts);
