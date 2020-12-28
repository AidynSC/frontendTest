const loader = (text) => {
    const loader = document.createElement('h1')
    text ? loader.innerText = text : loader.innerText = 'Пожалуйста, подождите, данные загружаются'
    document.body.appendChild(loader)
    return loader
}

const createTable = () => {
    const table = document.createElement('table')
    const tbody = document.createElement('tbody')
    const tr = document.createElement('tr')
    tr.innerHTML = `<tr>
                        <th>Имя</th>
                        <th>Название</th>
                        <th>Количество</th>
                    </tr>`
    tbody.id = 'table'

    document.body.appendChild(table)
    table.appendChild(tr)
    table.appendChild(tbody)

    return tbody
}

const renderData = async (table, loadText) => {
    const request = async url => {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/' + url)
            return await response.json()
        } catch (e) {
            throw e
        }
    }

    const users = await request('users')
    const posts = await request('posts')
    const comments = await request('comments')

    if (!Array.isArray(users) || !Array.isArray(posts) || !Array.isArray(comments)) return loadText.innerText = 'Упс, ошибка при получении данных'

    loadText.innerText = ''
    
    const postComments = {}
    comments.forEach(comment => {
        postComments[comment.postId] ? postComments[comment.postId].push(comment) : postComments[comment.postId] = [comment]
    })

    const userPosts = {}
    posts.forEach(post => {
        const formatPost = {...post, comments: postComments[post.id]}
        userPosts[post.userId] ? userPosts[post.userId].push(formatPost) : userPosts[post.userId] = [formatPost]
    })

    const data = users.map(user => {
        return {
            ...user,
            posts: userPosts[user.id]
        }
    })

    let template = '';
    data.forEach(user => {
        user.posts.forEach(post => {
            template += `
            <tr id=${post.id}>
                <td>${user.name}</td>
                <td>${post.title}</td>
                <td>${post.comments.length}</td>
            </tr>
        `
        })
    });

    table.innerHTML = template;
    table.addEventListener('click', async e => {
        const { id, lastElementChild } = e.target.parentElement
        const value = lastElementChild.innerText
        lastElementChild.innerText = 'Количество обновляется...'

        const updatedComments = await request(`posts/${id}/comments`)
        if(!Array.isArray(updatedComments)) {
            loadText.innerText = 'Ошибка при обновлении количества, попробуйте позже'
            return lastElementChild.innerText = `Предыдущее значение: ${value}`
        }

        lastElementChild.innerText = updatedComments.length
    })
}

window.addEventListener('DOMContentLoaded', () => {
    const loadText = loader()
    const table = createTable()
    renderData(table, loadText)
})