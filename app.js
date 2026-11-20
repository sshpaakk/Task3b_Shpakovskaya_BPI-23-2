
const loadBtn = document.getElementById("loadBtn");
const searchInput = document.getElementById("searchInput");
const usersList = document.getElementById("usersList");
const postsList = document.getElementById("postsList");
const statusText = document.getElementById("status");

let users = [];
let postsRequestId = 0;

//вывод сообщений о загрузке, успехе и ошибках
function showStatus(message, type = "") {
    statusText.textContent = message;
    statusText.className = type;
}

//загрузка списка пользователей
async function loadUsers() {
    loadBtn.disabled = true;
    showStatus("Загрузка пользователей...", "loading");

    users = [];
    postsRequestId++;
    usersList.textContent = "";
    postsList.textContent = "Выберите пользователя для просмотра публикаций";

    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/users"
        );

        //проверяем http-статус ответа
        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} ${response.statusText}`
            );
        }

        users = await response.json();

        //показываем пользователей с учетом введенного поиска
        searchUsers();

        showStatus(
            `Пользователи успешно загружены. HTTP ${response.status} OK. Всего: ${users.length}`,
            "success"
        );

    } catch (error) {
        //выводим сообщение об ошибке запроса
        if (error instanceof TypeError) {
            showStatus(
                "Ошибка сети: не удалось подключиться к серверу. Попробуйте ещё раз.",
                "error"
            );
        } else {
            showStatus(
                `Ошибка загрузки пользователей: ${error.message}`,
                "error"
            );
        }

        usersList.textContent = "Не удалось загрузить пользователей";

    } finally {
        //включаем кнопку после завершения запроса
        loadBtn.disabled = false;
    }
}

//отображение пользователей на странице
function showUsers(userList) {
    usersList.textContent = "";

    if (userList.length === 0) {
        usersList.textContent = "Пользователи не найдены";
        return;
    }

    userList.forEach(user => {
        const card = document.createElement("div");
        card.className = "user-card";

        const name = document.createElement("h3");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = "Email: " + user.email;

        const city = document.createElement("p");
        city.textContent = "Город: " + user.address.city;

        const button = document.createElement("button");
        button.textContent = "Показать публикации";

        //обработчик кнопки конкретного пользователя
        button.addEventListener("click", () => {
            loadPosts(user.id, button);
        });

        card.append(name, email, city, button);
        usersList.appendChild(card);
    });
}

//поиск по имени без повторного запроса к серверу
function searchUsers() {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchText)
    );

    showUsers(filteredUsers);
}

//загрузка публикаций выбранного пользователя
async function loadPosts(userId, button) {
    const requestId = ++postsRequestId;

    button.disabled = true;
    postsList.textContent = "Загрузка...";
    showStatus("Загрузка публикаций...", "loading");

    try {
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
        );

        //проверяем успешность http-запроса
        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status} ${response.statusText}`
            );
        }

        const posts = await response.json();

        //игнорируем устаревшие ответы сервера
        if (requestId !== postsRequestId) {
            return;
        }

        //берем только первые три публикации
        const firstPosts = posts.slice(0, 3);

        postsList.textContent = "";

        if (firstPosts.length === 0) {
            postsList.textContent = "Публикации не найдены";
        }

        firstPosts.forEach(post => {
            const card = document.createElement("div");
            card.className = "post-card";

            const title = document.createElement("h3");
            title.textContent = post.title;

            const body = document.createElement("p");
            body.textContent = post.body;

            card.append(title, body);
            postsList.appendChild(card);
        });

        showStatus(
            `Публикации успешно загружены. HTTP ${response.status} OK. Показано: ${firstPosts.length}`,
            "success"
        );

    } catch (error) {
        if (requestId !== postsRequestId) {
            return;
        }

        postsList.textContent = "Не удалось загрузить публикации";

        //обрабатываем http-ошибки и сетевые сбои
        if (error instanceof TypeError) {
            showStatus(
                "Ошибка сети: не удалось загрузить публикации. Попробуйте ещё раз.",
                "error"
            );
        } else {
            showStatus(
                `Ошибка загрузки публикаций: ${error.message}`,
                "error"
            );
        }

    } finally {
        //возвращаем кнопку в активное состояние
        button.disabled = false;
    }
}

//обработчики событий страницы
loadBtn.addEventListener("click", loadUsers);
searchInput.addEventListener("input", searchUsers);
