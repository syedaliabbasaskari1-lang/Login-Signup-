let currentUser = null;

/* LocalStorage Helpers */
function getUsers(){return JSON.parse(localStorage.getItem("users")||"[]");}
function saveUsers(users){localStorage.setItem("users",JSON.stringify(users));}

/* Navigation */
function showSignup(){hideAll();document.getElementById("signup").classList.remove("hidden");}
function showLogin(){hideAll();document.getElementById("login").classList.remove("hidden");}
function backLanding(){hideAll();document.getElementById("landing").classList.remove("hidden");}
function backDashboard(){hideAll();document.getElementById("dashboard").classList.remove("hidden");}
function openProfile(){
  hideAll();
  document.getElementById("profile").classList.remove("hidden");
  document.getElementById("profileName").innerText=currentUser.name;
  document.getElementById("profileEmail").innerText=currentUser.email;
  document.getElementById("profileGender").innerText=currentUser.gender;
}
function hideAll(){document.querySelectorAll(".container,.dashboard").forEach(el=>el.classList.add("hidden"));}

/* Toggle Password */
function togglePassword(id){
  const input=document.getElementById(id);
  input.type = input.type==="password" ? "text":"password";
}

/* Signup */
function signup(){
  let name=document.getElementById("signupName").value.trim();
  let email=document.getElementById("signupEmail").value.trim();
  let password=document.getElementById("signupPassword").value;
  let gender=document.getElementById("signupGender").value;
  if(!name||!email||!password||!gender){
    Swal.fire("Error","All fields required","error");return;
  }
  let users=getUsers();
  if(users.find(u=>u.email===email)){
    Swal.fire("Already Exists","You already signed up. Please login.","warning");return;
  }
  users.push({name,email,password,gender});
  saveUsers(users);
  Swal.fire("Success","Signup successful! Please login.","success");
  showLogin();
}

/* Login */
function login(){
  let email=document.getElementById("loginEmail").value.trim();
  let password=document.getElementById("loginPassword").value;
  let users=getUsers();
  let user=users.find(u=>u.email===email && u.password===password);
  if(user){
    currentUser=user;
    Swal.fire("Welcome",`Hello ${user.name}`,"success");
    loadDashboard();
  } else {
    Swal.fire("Error","Invalid credentials","error");
  }
}

/* Logout */
function logout(){currentUser=null;hideAll();backLanding();}

/* Dashboard */
function loadDashboard(){
  hideAll();
  document.getElementById("dashboard").classList.remove("hidden");
  document.getElementById("welcomeUser").innerText=`Welcome, ${currentUser.name}!`;

  let tbody=document.getElementById("userTable");tbody.innerHTML="";
  let users=getUsers();
  users.forEach((u)=>{
    let row=document.createElement("tr");
    row.innerHTML=`<td>${u.name}</td><td>${u.email}</td><td>${u.gender}</td>`;
    tbody.appendChild(row);
  });

  updateScore();
}

/* Profile Update/Delete */
function updateProfile(){
  let name=document.getElementById("editName").value.trim();
  let password=document.getElementById("editPassword").value;
  let gender=document.getElementById("editGender").value;

  let users=getUsers();
  let u=users.find(u=>u.email===currentUser.email);
  if(name) u.name=name;
  if(password) u.password=password;
  if(gender) u.gender=gender;
  saveUsers(users);
  currentUser=u;
  Swal.fire("Success","Profile updated","success");
  openProfile();
}

function deleteAccount(){
  Swal.fire({
    title:"Are you sure?",
    text:"This will delete your account permanently!",
    icon:"warning",
    showCancelButton:true,
    confirmButtonText:"Yes, delete it!"
  }).then(res=>{
    if(res.isConfirmed){
      let users=getUsers().filter(u=>u.email!==currentUser.email);
      saveUsers(users);
      currentUser=null;
      Swal.fire("Deleted","Your account has been deleted","success");
      backLanding();
    }
  });
}

/* -------- GK QUIZ (Open Trivia API) -------- */
let score=0;

async function loadQuiz(){
  try{
    const res=await fetch("https://opentdb.com/api.php?amount=1&category=9&type=multiple");
    const data=await res.json();
    const q=data.results[0];
    const question=q.question;
    const correct=q.correct_answer;
    const options=[...q.incorrect_answers,correct].sort(()=>Math.random()-0.5);

    document.getElementById("quizQuestion").innerHTML=question;
    let optHTML="";
    options.forEach(opt=>{
      optHTML+=`<button onclick="checkAnswer('${opt}','${correct}')">${opt}</button>`;
    });
    document.getElementById("quizOptions").innerHTML=optHTML;
  }catch(e){
    console.error(e);
    document.getElementById("quizQuestion").innerText="Failed to load question.";
  }
}

function checkAnswer(ans,correct){
  if(ans===correct){
    score++;
    Swal.fire("Correct!","","success");
  }else{
    Swal.fire("Wrong!",`Correct answer: ${correct}`,"error");
  }
  updateScore();
}

function updateScore(){
  document.getElementById("quizScore").innerText=`Score: ${score}`;
}
