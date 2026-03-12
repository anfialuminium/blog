const ADMIN_PASSWORD = '3737';

// UI Elements
const loginArea = document.getElementById('login-area');
const adminPanel = document.getElementById('admin-panel');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const postsList = document.getElementById('posts-list');
const postModal = document.getElementById('post-modal');
const addPostBtn = document.getElementById('add-post-btn');
const closeModalBtn = document.getElementById('close-modal');
const postForm = document.getElementById('post-form');

const modalTitle = document.getElementById('modal-title');
const postIdInput = document.getElementById('post-id');
const postTitleInput = document.getElementById('post-title');
const postImageInput = document.getElementById('post-image');
const postContentInput = document.getElementById('post-content');

// Check Login State
if (sessionStorage.getItem('anfi_admin_logged_in') === 'true') {
    showAdmin();
}

// Login Logic
loginBtn.addEventListener('click', () => {
    if (passwordInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('anfi_admin_logged_in', 'true');
        showAdmin();
    } else {
        loginError.style.display = 'block';
        passwordInput.value = '';
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('anfi_admin_logged_in');
    location.reload();
});

function showAdmin() {
    loginArea.style.display = 'none';
    adminPanel.style.display = 'block';
    renderAdminPosts();
}

// Post Management - Supabase
async function fetchPosts() {
    try {
        const { data, error } = await supabaseClient
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching admin posts:', error);
        return [];
    }
}

async function renderAdminPosts() {
    postsList.innerHTML = '<tr><td colspan="3" style="text-align: center;">טוען פוסטים...</td></tr>';
    
    const posts = await fetchPosts();
    
    postsList.innerHTML = '';
    if (posts.length === 0) {
        postsList.innerHTML = '<tr><td colspan="3" style="text-align: center;">אין פוסטים להצגה.</td></tr>';
        return;
    }

    posts.forEach(post => {
        const tr = document.createElement('tr');
        const dateStr = new Date(post.created_at).toLocaleDateString('he-IL');
        
        tr.innerHTML = `
            <td>${dateStr}</td>
            <td><strong>${post.title}</strong></td>
            <td class="admin-actions">
                <button class="btn btn-small" onclick="editPost('${post.id}')">ערוך</button>
                <button class="btn btn-small btn-danger" onclick="deletePost('${post.id}')">מחק</button>
            </td>
        `;
        postsList.appendChild(tr);
    });
}

// Global scope functions for onclick
window.deletePost = async function(id) {
    if (confirm('האם אתה בטוח שברצונך למחוק פוסט זה?')) {
        try {
            const { error } = await supabaseClient
                .from('blog_posts')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            renderAdminPosts();
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('שגיאה במחיקת הפוסט');
        }
    }
}

window.editPost = async function(id) {
    try {
        const { data: post, error } = await supabaseClient
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;

        modalTitle.innerText = 'עריכת פוסט';
        postIdInput.value = post.id;
        postTitleInput.value = post.title;
        postImageInput.value = post.image_url || '';
        postContentInput.value = post.content;
        postModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching post for edit:', error);
        alert('שגיאה בטעינת נתוני הפוסט');
    }
}

// Modal Handlers
addPostBtn.addEventListener('click', () => {
    modalTitle.innerText = 'הוספת פוסט חדש';
    postIdInput.value = '';
    postForm.reset();
    postModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    postModal.style.display = 'none';
});

window.onclick = function(event) {
    if (event.target == postModal) {
        postModal.style.display = 'none';
    }
}

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = postIdInput.value;
    const title = postTitleInput.value;
    const image_url = postImageInput.value;
    const content = postContentInput.value;

    const postData = { title, image_url, content, updated_at: new Date().toISOString() };

    try {
        if (id) {
            // Update
            const { error } = await supabaseClient
                .from('blog_posts')
                .update(postData)
                .eq('id', id);
            if (error) throw error;
        } else {
            // Create
            const { error } = await supabaseClient
                .from('blog_posts')
                .insert([postData]);
            if (error) throw error;
        }

        postModal.style.display = 'none';
        renderAdminPosts();
    } catch (error) {
        console.error('Error saving post:', error);
        alert('שגיאה בשמירת הפוסט');
    }
});
