const USERS_API = "http://localhost:8000/users";
const POSTS_API = "http://localhost:8000/posts";

let registerModalBtn = document.querySelector("#registerModalBtn");
let loginModalBtn = document.querySelector("#loginModalBtn");
let registerModalBlock = document.querySelector("#registerUser-block");
let loginModalBlock = document.querySelector("#loginUser-block");
let registerBtn = document.querySelector("#registerBtn");
let loginBtn = document.querySelector("#loginBtn");
let closeModalBtn = document.querySelector("#closeBtn");
let logoutBtn = document.querySelector("#logoutBtn");

//hide/show modals
registerModalBtn.addEventListener("click", () => {
  registerModalBlock.setAttribute("style", "display: flex !important;");
  registerBtn.setAttribute("style", "display: flex !important;");
  loginModalBlock.setAttribute("style", "display: none !important");
  loginBtn.setAttribute("style", "display: none !important");
});

loginModalBtn.addEventListener("click", () => {
  registerModalBlock.setAttribute("style", "display: none !important;");
  registerBtn.setAttribute("style", "display: none !important;");
  loginModalBlock.setAttribute("style", "display: flex !important");
  loginBtn.setAttribute("style", "display: flex !important");
});

//const Web Api from JSON

//get data
async function getUsersData() {
  let res = await fetch(USERS_API);
  let users = await res.json();
  return users;
}

//register

let regUsernameInp = document.querySelector("#reg-username");
let regPasswordInp = document.querySelector("#reg-password");
let regConfPasswordInp = document.querySelector("#reg-passwordConfirm");

registerBtn.addEventListener("click", register);

async function register() {
  if (
    !regUsernameInp.value.trim() ||
    !regPasswordInp.value.trim() ||
    !regConfPasswordInp.value.trim()
  ) {
    alert("Fill all inputs, some of them are empty!");
    return;
  }

  if (regPasswordInp.value !== regConfPasswordInp.value) {
    alert("Passwords don't match");
    return;
  }

  let userObj = {
    username: regUsernameInp.value,
    password: regPasswordInp.value,
  };

  let users = await getUsersData();

  fetch(USERS_API, {
    method: "POST",
    body: JSON.stringify(userObj),
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  regUsernameInp.value = "";
  regPasswordInp.value = "";
  regConfPasswordInp.value = "";

  closeModalBtn.click();

//   render();
}

//authorization || login

let loginUsernameInp = document.querySelector("#login-username");
let loginPassInp = document.querySelector("#login-password");

let showUsername = document.querySelector("#showUsername");

function checkLoginLogoutStatus() {
  let user = localStorage.getItem("user");

  if (!user) {
    loginModalBtn.parentNode.style.display = "block"; //если не авторизован то покажи
    logoutBtn.parentNode.style.display = "none"; //спрячь
    showUsername.innerText = "No user";
  } else {
    loginModalBtn.parentNode.style.display = "none"; //спрячь
    logoutBtn.parentNode.style.display = "block"; //покажи
    showUsername.innerText = JSON.parse(user).username;
  }

  // showCreatePostPanel();
}

checkLoginLogoutStatus(); //в момент загрузки, потому что вдруг он авторизовался еще вчера

function checkExistingUser(username, users) {
  return users.some((item) => item.username === username);
}

function checkUserPass(user, password) {
  return user.password === password;
}

function setUsersToStorage(username, id) {
  localStorage.setItem(
    "user",
    JSON.stringify({
      username,
      id,
    })
  );
}

loginBtn.addEventListener("click", login);

async function login() {
  if (!loginUsernameInp.value.trim() || !loginPassInp.value.trim()) {
    alert("Fill all inputs, some of them are empty!");
    return;
  }

  let users = await getUsersData();

  if (!checkExistingUser(loginUsernameInp.value, users)) {
    alert("There is no such user");
    return;
  }

  let userObj = users.find((item) => item.username === loginUsernameInp.value);

  if (!checkUserPass(userObj, loginPassInp.value)) {
    alert("Wrong password!");
    return;
  }

  setUsersToStorage(userObj.username, userObj.id, userObj.favorites);

  loginUsernameInp.value = "";
  loginPassInp.value = "";


};
  checkLoginLogoutStatus();

  closeModalBtn.click();


//logout logic
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  checkLoginLogoutStatus();
  render()
});

//! CRUD start
let post_form = document.querySelector("#post_add_form");
let msg = document.querySelector(".msg");
let all_posts = document.querySelector(".all-post");
let edit_post = document.querySelector("#edit_post");
let comment_user = document.querySelector("#comment-user");

let getLSData  = (key) => {
    if(localStorage.getItem(key) ){
        return JSON.parse(localStorage.getItem(key));
    } else {
        return false;
    };
};

const createLSData = (key, value) => {

    let data = [];
    if (localStorage.getItem(key)) {
        data = JSON.parse(localStorage.getItem(key));
    };

    data.push(value);

    localStorage.setItem(key, JSON.stringify(data));
};

// Update LS Data
const updateLSData = (key, array) => {
    localStorage.setItem(key, JSON.stringify(array));
};

// Send post data to the JSON server
const sendPostDataToServer = async (data) => {
    try {
        let res = await fetch(POSTS_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        let json = await res.json();
        console.log(json);
    } catch (error) {
        console.error(error);
    };
};

post_form.onsubmit = async (e) => {
    e.preventDefault();

    let form_data = new FormData(e.target);
    let data = Object.fromEntries(form_data.entries());
    let { aname, aphoto, pcontent, pdate, pphoto } = Object.fromEntries(form_data.entries());

    if ( !aname || !aphoto || !pcontent || !pdate || !pphoto) {
        msg.innerHTML = alert('Fields Are Required!');
    } else {
        let id = Math.floor(Math.random() * 1000) + '_' + Date.now();
        let dataObj = {...data, id};

        createLSData('ins_post', dataObj);
        await sendPostDataToServer(dataObj);
        e.target.reset();
        render();
    };
};



let render = () => { 
    let post = getLSData('ins_post'); 
    let list = ''; 
 
    if (!post) { 
        all_posts.innerHTML = `<div class="card shadow-sm text-center mt-3"><div class="card-body">No post found</div></div>`; 
        return false; 
    };
 
    if (post) { 
        post.reverse().map((item) => { 
            list += ` 
                 
        <div class="post"> 
            <div class="info"> 
                <div class="user"> 
                    <div class="profile-pic"> 
                        <img src="${ item.aphoto }" alt=""> 
                    </div> 
                    <p class="username">${ item.aname }</p> 
                </div> 
                <!-- Edit Delete --> 
                <div class="dropdown"> 
                    <a class="dropdown-toggle" href="#" data-bs-toggle="dropdown"> 
                        <i class="fas fa-ellipsis-h"></i> 
                    </a> 
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuLink"> 
                      <li><a data-bs-toggle="modal" editLsData="${item.id}" data-bs-target="#edit-modal" class="dropdown-item post_edit" href="#">Edit</a></li> 
                      <li><a class="dropdown-item post_delete" deleteLsData="${item.id}" href="#">Delete</a></li> 
                    </ul> 
                </div> 
            </div> 
            <img src="${ item.pphoto }" class="post-image" alt=""> 
            <div class="post-content"> 
                <div class="reaction-wrapper"> 
                    <img src="./img/like.png" class="icon" alt="" id="like-button"> 
                    <img src="./img/comment.png" class="icon" alt=""> 
                    <img src="./img/send.png" class="icon" alt=""> 
                    <img src="./img/save.png" class="save icon" alt=""> 
                </div> 
                    <p class="likes">89 likes</p> 
                    <p class="description"><span>${ item.aname }</span>${ item.pcontent }</p> 
                <div class="comment-wrapper"> 
                    <img src="./img/smile.png" class="icon" alt=""> 
                    <input type="text" class="comment-box" placeholder="Add a comment"> 
                    <button class="comment-btn">Post</button> 
                </div> 
            </div> 
                <p class="post-time">${ item.pdate }</p> 
        </div> 
         
                `; 
        }); 
         
    } 
    all_posts.innerHTML = list; 

} 
render();

//! likes start
let likes = 89;
let currentLikeStatus = "neutral";

let likeButton = document.querySelector("#like-button");
let likesElement = document.querySelector(".likes");

likeButton.addEventListener("click", function () {
  if (currentLikeStatus === "neutral") {
    likes++;
    likesElement.innerHTML = likes + " likes";
    currentLikeStatus = "liked";
  } else if (currentLikeStatus === "liked") {
    likes--;
    likesElement.innerHTML = likes + " likes";
    currentLikeStatus = "neutral";
  }
});

//! likes end


//! comments logic start 
document.querySelector(".comment-btn").addEventListener("click", function() {
    var commentText = document.querySelector(".comment-box").value;
    var postId = document.getElementById("post").getAttribute("data-post-id");
  
    // send request to the server to add the comment
    fetch(`${POSTS_API}/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        comments: [
          ...post.comments,
          { text: commentText }
        ]
      })
    })
    .then(res => res.json())
    .then(post => {
      // add the comment to the UI
      var comment = document.createElement("div");
      comment.classList.add("comment");
      comment.innerHTML = "<p>" + commentText + "</p>";
      document.getElementById("post").appendChild(comment);
    })
    .catch(error => console.error(error));
  });
//! comments logic end 

all_posts.onclick = (e) => {
  if (e.target.hasAttribute("editlsdata")) {
    let id = e.target.getAttribute("editLsData");
    let data = getLSData("ins_post");
    let singleData = data.find((item) => item.id == id);

    edit_post.innerHTML = `
                        <div class="my-3">
                            <label for="">Author Name</label>
                            <input name="aname" type="text" value="${singleData.aname}" class="form-control" id="postName">
                            <input name="id" value="${singleData.id}" type="hidden"/>
                        </div>
                        <div class="my-3">
                            <label for="">Author Profile Photo</label>
                            <input name="aphoto" type="text" value="${singleData.aphoto}" class="form-control" id="postImage">
                        </div>
                        <div class="my-3">
                            <label for="">Post Content</label>
                            <textarea name="pcontent" class="form-control" placeholder="Write a caption..."">${singleData.pcontent}</textarea>
                        </div>
                        <div class="my-3">
                            <label for="">Post Photo</label>
                            <input name="pphoto" type="text" value="${singleData.pphoto}" class="form-control" id="postPhoto">
                        </div>
                        <div class="my-3">
                            <label for="">Please Mention Your Post Date</label>
                            <input name="pdate" type="date" value="${singleData.pdate}" class="form-control">
                        </div>
                        <div class="my-3">
                            <!-- <button type="button" class="btn btn-primary w-100">Create Post</button> -->
                            <input type="submit" class="btn btn-primary w-100" value="Update Post">
                        </div>
        `;
    console.log(id);
  }

  if (e.target.hasAttribute("deleteLsData")) {
    let id = e.target.getAttribute("deleteLsData");

    if (confirm("Are Your Sure? You want to delete this post?") == true) {
      let ddelete = getLSData("ins_post");
      let index = ddelete.findIndex((item) => item.id == id);
      console.log(ddelete);
      ddelete.splice(index, 1);
      updateLSData("ins_post", ddelete);
      render();
    }
  }
};

edit_post.onsubmit = (e) => {
  e.preventDefault();

  let form_data = new FormData(e.target);
  let { aname, aphoto, pcontent, pdate, pphoto, id } = Object.fromEntries(
    form_data.entries()
  );
  let post = getLSData("ins_post");
  let index = post.findIndex((item) => item.id == id);
  post[index] = { aname, aphoto, pcontent, pdate, id, pphoto };

  updateLSData("ins_post", post);
  render();
};

//! CRUD end
//! live search
let searchInp = document.querySelector(".search-box");
searchInp.addEventListener("input", () => {
  search = searchInp.value;
  console.log(search);
  render();
});
//* search logic end

//! pagination
