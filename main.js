// --- FIREBASE MODULAR SDK ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCqzY8z1xHqtrLzD1y1-z6Wul76vzRzWZI",
  authDomain: "anonymous-f58ec.firebaseapp.com",
  projectId: "anonymous-f58ec",
  storageBucket: "anonymous-f58ec.firebasestorage.app",
  messagingSenderId: "866152946828",
  appId: "1:866152946828:web:01ac9b4e792a3ef904afa9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- ELEMENTS ---
let posts = [];
const deviceViews = JSON.parse(localStorage.getItem('deviceViews')||'{}');

const homeDiv=document.getElementById("homeDiv");
const postDiv=document.getElementById("postDiv");
const aboutDiv=document.getElementById("aboutDiv");
const viewPostDiv=document.getElementById("viewPostDiv");
const searchInput=document.getElementById("searchInput");

const openPostDivBtn=document.getElementById("openPostDiv");
const cancelPostBtn=document.getElementById("cancelPost");
const submitPostBtn=document.getElementById("submitPost");
const openAboutDivBtn=document.getElementById("openAboutDiv");
const closeAboutBtn=document.getElementById("closeAbout");
const homeBtn=document.getElementById("homeBtn");
const backToHomeBtn=document.getElementById("backToHome");

const viewTitle=document.getElementById("viewTitle");
const viewAlias=document.getElementById("viewAlias");
const viewMessage=document.getElementById("viewMessage");
const viewDate=document.getElementById("viewDate");
const viewStats=document.getElementById("viewStats");

const tbody=document.querySelector("#postsTable tbody");

// --- HELPERS ---
function sanitize(str){ return str.replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function showDiv(div){ homeDiv.style.display=postDiv.style.display=viewPostDiv.style.display=aboutDiv.style.display="none"; div.style.display="block"; }

// --- EVENT LISTENERS ---
openPostDivBtn.onclick=()=>showDiv(postDiv);
cancelPostBtn.onclick=()=>showDiv(homeDiv);
openAboutDivBtn.onclick=()=>showDiv(aboutDiv);
closeAboutBtn.onclick=()=>showDiv(homeDiv);
homeBtn.onclick=()=>showDiv(homeDiv);
backToHomeBtn.onclick=()=>showDiv(homeDiv);
searchInput.addEventListener("input",()=>renderPosts(searchInput.value));

// --- LOAD POSTS ---
async function loadPosts(){
  posts=[];
  const q=query(collection(db,"posts"),orderBy("date","desc"));
  const snapshot=await getDocs(q);
  snapshot.forEach(doc=>{
    posts.push(doc.data());
  });
  renderPosts(searchInput.value);
}

// --- RENDER POSTS ---
function renderPosts(filter=""){
  tbody.innerHTML="";
  posts.slice().reverse().forEach((post)=>{
    if(filter && !post.title.toLowerCase().includes(filter.toLowerCase())) return;

    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="clickable-title">${sanitize(post.title)}</td>
                  <td>${sanitize(post.alias||"Anonymous")}</td>
                  <td>${post.views||0}</td>
                  <td>${post.date}</td>`;
    tbody.appendChild(tr);

    tr.onclick=()=>{
      const id = post.title;
      if(!deviceViews[id]){
        post.views=(post.views||0)+1;
        deviceViews[id]=true;
        localStorage.setItem('deviceViews',JSON.stringify(deviceViews));
      }
      viewTitle.textContent=sanitize(post.title);
      viewAlias.textContent="By: "+sanitize(post.alias||"Anonymous");
      viewMessage.textContent=sanitize(post.message);
      viewDate.textContent="Posted: "+post.date;
      viewStats.textContent=`Views: ${post.views||0}`;
      showDiv(viewPostDiv);
      renderPosts(searchInput.value);
    };
  });
}

// --- SUBMIT POST ---
submitPostBtn.onclick=async ()=>{
  const alias=sanitize(document.getElementById("aliasInput").value.trim());
  const title=sanitize(document.getElementById("titleInput").value.trim());
  const message=sanitize(document.getElementById("messageInput").value.trim());
  if(!title||!message) return alert("Title and message are required!");
  const date=new Date().toLocaleString();

  const newPost = {title, alias:alias||"Anonymous", message, date, views:0};
  try{
    await addDoc(collection(db,"posts"), newPost);
    showDiv(homeDiv);
    loadPosts();
    document.getElementById("aliasInput").value="";
    document.getElementById("titleInput").value="";
    document.getElementById("messageInput").value="";
  }catch(e){ console.error(e); alert("Failed to post!"); }
};

// --- INITIAL LOAD ---
loadPosts();