document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('todo-input');
    const addButton = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const progressBar = document.getElementById('progress-bar');
    const loader = document.createElement('div');
    loader.classList.add('loader');
  
   
    loader.innerHTML = `
      <div class="spinner"></div>
    `;
    document.body.appendChild(loader);
  
    const congratsModal = document.createElement('div');
    congratsModal.classList.add('congrats-modal');
    congratsModal.innerHTML = `
      <h2>Congratulations!</h2>
      <p>You completed all your tasks 🎉</p>
    `;
    document.body.appendChild(congratsModal);
  
    let totalTasks = 0;
    let completedTasks = 0;
    let hasShownCongrats = false;
  
   
    const showLoader = (duration) => {
      loader.style.display = 'flex';
      return new Promise((resolve) => setTimeout(resolve, duration));
    };
  
   
    const hideLoader = () => {
      loader.style.display = 'none';
    };
  
    const lazyLoadTasks = async (tasks) => {
      for (let i = 0; i < tasks.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200)); 
        createTaskElement(tasks[i].text, tasks[i].completed, false);
      }
      updateProgress(true); 
      hideLoader();
    };
  

    const loadTasks = async () => {
      await showLoader(1000); // Show loader for 1 second
      const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
      lazyLoadTasks(savedTasks); 
    };
  
 
    const saveTasks = () => {
      const tasks = Array.from(todoList.children).map((listItem) => {
        const checkbox = listItem.querySelector('.task-checkbox');
        const text = listItem.querySelector('span').innerText;
        return { text, completed: checkbox.checked };
      });
      localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const updateProgress = (triggerModal = true) => {
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      progressBar.style.width = `${progress}%`;
  
      if (completedTasks === totalTasks && totalTasks > 0) {
        if (!hasShownCongrats && triggerModal) {
          congratsModal.style.display = 'block';
          setTimeout(() => {
            congratsModal.style.display = 'none';
          }, 3000); 
          hasShownCongrats = true;
        }
      } else {
        hasShownCongrats = false;
      }
    };
  
  
    const createTaskElement = (taskText, isCompleted = false, save = true) => {
      totalTasks++;
      if (isCompleted) completedTasks++;
  
      const listItem = document.createElement('li');
      listItem.innerHTML = `
        <label>
          <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} />
          <span>${taskText}</span>
        </label>
        <div class="task-actions">
          <button class="edit-btn">✏️</button>
          <button class="delete-btn">&times;</button>
        </div>
      `;
  
  
      listItem.querySelector('.task-checkbox').addEventListener('change', (e) => {
        if (e.target.checked) {
          completedTasks++;
        } else {
          completedTasks--;
        }
        saveTasks();
        updateProgress();
      });
  
      // Handle task editing
      listItem.querySelector('.edit-btn').addEventListener('click', () => {
        const span = listItem.querySelector('span');
        const currentText = span.innerText;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
  
        span.replaceWith(input);
        input.focus();
  
        const saveEdit = () => {
          const newText = input.value.trim();
          if (newText === '') {
            alert('Task cannot be empty!');
            input.focus();
            return;
          }
          span.innerText = newText;
          input.replaceWith(span);
          saveTasks(); 
        };
  
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') saveEdit();
        });
      });
  
      
      listItem.querySelector('.delete-btn').addEventListener('click', () => {
        if (listItem.querySelector('.task-checkbox').checked) {
          completedTasks--;
        }
        totalTasks--;
        listItem.remove();
        saveTasks();
        updateProgress(false); 
      });
  
      todoList.appendChild(listItem);
      if (save) saveTasks();
      updateProgress(false); 
    };
  
   
    const addTask = async () => {
      const taskText = inputField.value.trim();
      if (taskText === '') return alert('Please enter a task!');
  
      await showLoader(500); 
      createTaskElement(taskText);
      inputField.value = '';
      hideLoader();
    };
  
    addButton.addEventListener('click', addTask);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });
  
    loadTasks();
  });
  