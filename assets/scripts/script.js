const projects = JSON.parse(localStorage.getItem("projectsxxx")) || {name:"ultimate",subTasks:[],count:0,id:0,path:[]};
const newProjectMod = document.querySelector("#new-project-mod");
const newProjectForm = document.querySelector("#new-project-form");
const newProjectName = document.querySelector("#new-project-name");
const newProjectNameError = document.querySelector("#new-project-name-error")
const newProjectDueDate = document.querySelector("#new-project-due-date");
const newProjectDueDateError = document.querySelector("#new-project-due-date-error");
const openNewProjectModBtn = document.querySelector("#open-new-project-mod");
const navBar = document.querySelector("nav");
const hideDone = true;

class Task{
    constructor(superTask,name,dueDate){
        projects.count++;
        this.id = projects.count;
        this.index = superTask.subTasks.length;
        this.name = name;
        this.dueDate = dueDate;
        this.subTasks = [];
        this.path = [...superTask.path,this.id];
        // this.superTask = superTask;
        superTask.subTasks.push(this);
        localStorage.setItem("projectsxxx",JSON.stringify(projects));
    }
}
openNewProjectModBtn.addEventListener('click',(e)=>{
    e.stopPropagation();
    navBar.classList.add("hide")
    newProjectMod.classList.remove("hide")
})

newProjectForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    if (!newProjectName.value){
        newProjectNameError.textContent = "Invalid Name"
        return;
    }
    else if(!newProjectDueDate.value){
        newProjectNameError.textContent = "";
        newProjectDueDateError.textContent = "Pick a Due Date"
        return;
    }
    newProjectNameError.textContent = "";
    newProjectDueDateError.textContent = "";
    new Task(projects,newProjectName.value,newProjectDueDate.value);
    e.target.parentNode.classList.add("hide")
    navBar.classList.remove("hide");
    e.target.querySelectorAll("input").forEach(input =>{
        if (input.type==="submit") return;
        input.value = "";
    })
    reloadSubs();
})

document.querySelectorAll(".close-mod").forEach(el => el.addEventListener("click",(e)=>{
    if (!e.target.classList.contains("close-mod")){
        return;
    }
    e.target.parentNode.classList.add("hide")
    navBar.classList.remove("hide");
    e.target.parentNode.querySelectorAll("input").forEach(input =>{
    if (input.type === "submit") return;
    input.value = ""
    })
}));

function loadAllSubs(project,el){
    el.dataset.isDone = project.done;
    (project.done)?el.classList.add("hide"):null;
    path = el?.dataset?.path;
    const title = document.createElement("h3");
    title.textContent = project.name;
    title.dataset.path = el.dataset.path;
    title.classList.add("task");
    project.done?title.classList.add("done"):null;
    el.append(title);
    const form = document.createElement("div");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.classList.add("delete-btn")
    deleteBtn.addEventListener("click",e=>{
        e.stopPropagation();
        let path = e.target.parentNode.dataset.path;
        !path.includes(",")?path=[path]:path = path.split(",")
        path = path.map((num)=>{
            return parseInt(num)
        });
        deleteTask(path);

    })
    title.append(deleteBtn)
    if (el.dataset.path){
        let nameId;
        let dateId;
        if (!el.dataset.path.includes(",")){
            nameId = "name"+el.dataset.path;
            dateId = "date"+el.dataset.path;
        }else{
            console.log(el.dataset.path)
            nameId = "name"+ el.dataset.path.replace(",","-_-")
            dateId = "date" + el.dataset.path.replace(",","-_-")
        }
        form.classList.add("subtask-input")
        form.innerHTML = `<input id=${nameId} type="text"/><input id=${dateId} type="date"/>`
        const addSubBtn =document.createElement("button");
        addSubBtn.textContent="Add Subtask"
        form.append(addSubBtn);
        addSubBtn.addEventListener('click',()=>{
            const name = document.querySelector("#"+nameId).value;
            const date = document.querySelector("#"+dateId).value;
            console.log(name,date)
            if (!name||!date){
                return
            }else{
                new Task(project,name,date);
                reloadSubs()
            }
        })
        el.append(form);
    }
    if (project.subTasks.length === 0) return;
    const list = document.createElement("ul");
    el.append(list);
    project.subTasks.forEach(subtask=>{
        const listItem = document.createElement("li");
        listItem.dataset.id = subtask.id;
        listItem.dataset.path = subtask.path;
        listItem.className = "task"
        list.append(listItem);
        loadAllSubs(subtask,listItem)
    })
}

reloadSubs();

function findById(parent,id){
    const subs = parent.subTasks;
    let index;
    for (let i = 0;i<subs.length;i++){
        if (subs[i].id == id) index = i;
    }
    return parent.subTasks[index]
}

function findIndexById(parent,id){
    const subs = parent.subTasks;
    let index;
    for (let i = 0;i<subs.length;i++){
        if (subs[i].id == id) index = i;
    }
    return index;
}

function findByPath(parent,path){
    if (path.length === 0) return;
    if (path.length===1){
        console.log("DONE DRILLING")
        let id = path[0];
        const obj = findById(parent,id);
        return obj;
    }
    let id = path.shift();
    return findByPath(findById(parent,id),path)
}

function findParentAndIndexByPath(parent,path){
    if (path.length === 0) return;
    if (path.length===1){
        console.log("DONE DRILLING")
        let id = path[0];
        const obj = {
            parent:parent,
            index:findIndexById(parent,id)
        }
        return obj;
    }
    let id = path.shift();
    return findParentAndIndexByPath(findById(parent,id),path)
}

document.addEventListener("click",e=>{
    if (e.target.classList.contains("task")){
        const path = e.target.dataset.path;
        const obj = findByPath(projects,path.split(","))
        obj.done = !obj.done;
        e.target.classList.toggle("done");
        localStorage.setItem("projectsxxx",JSON.stringify(projects));
    }
})

function reloadSubs(){
    const cont = document.querySelector("#projects-cont");
    cont.innerHTML =""
    loadAllSubs(projects,cont)
}

function deleteTask(path){
    const {parent,index} = findParentAndIndexByPath(projects,path);
    console.log(parent.subTasks)
    parent.subTasks.splice(index,1)
    localStorage.setItem("projectsxxx",JSON.stringify(projects));
    reloadSubs();
}