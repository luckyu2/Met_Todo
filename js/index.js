var app = new Vue({
  el: "#todo-app",
  
  // 数据
  data: function() {
    return {
      todos: todoStorage.fetch(),
      newTodoTitle: "",
      editedTodo: null,
      intention: "all",
      checkEmpty: false,
      recycleBin: [],
      dragIndex: "",
      enterIndex: "",
      show: true,
      delayTime: "1",
      isShow: false,
      shortCut: "开✨",
      popShow: true,
      windowWidth: document.documentElement.clientWidth,
      isMobile: isMobile
    }
  },

  // 监听器
  watch: {
    windowWidth(t) {},
    todos: {
      handler: function(t) {
        todoStorage.sava(t)
      },
      deep: true
    }
  },

  // 方法
  methods: {
    contorlScreen: function() {
      if (this.windowWidth < 768) {
        this.isShow = !this.isShow
        return this.shortCut = "筛选"
      }
    },

    togglePop: function() {
      this.popShow = !this.popShow
    },

    shortCutAction: function() {
      this.isShow = !this.isShow
      return this.isShow ? this.shortCut = "关" : this.shortCut = "开✨"
    },

    shuffle: function() {
      this.filteredTodos = _.shuffle(this.filteredTodos)
    },

    addTodo: function(t) {
      if (this.newTodoTitle !== "") {
        this.todos.unshift({
          id: todoStorage.uid++,
          title: this.newTodoTitle,
          completed: false,
          removed: false
        })
        this.newTodoTitle = ""
        this.checkEmpty = false
        this.delayTime = "0"
      } else {
        this.checkEmpty = true
      }
    },

    markAsCompleted: function(t) {
      t.completed = true
    },

    markAsUncompleted: function(t) {
      t.completed = false
    },

    markAllAsCompleted: function() {
      if (confirm("确认全部待办事项都已完成?")) {
        this.todos.map(function(t) {
          if (!t.completed) {
            t.completed = true
            layer.msg("今天辛苦了")
          }
        })
      }
    },

    removeTodo: function(t) {
      let e = this.todos.splice(this.todos.indexOf(t), 1)[0]
      e.removed = true
      this.recycleBin.unshift(e)
    },

    restoreTodo: function(t) {
      t.removed = false
      this.todos.unshift(t)
      let e = this.recycleBin.indexOf(t)
      this.recycleBin.splice(e, 1)
    },

    editdTodo: function(t) {
      this.editedTodo = {
        id: t.id,
        title: t.title
      }
    },

    editDone: function(t) {
      if (t.title === "") {
        this.removeTodo(t)
      }
      this.editedTodo = null
    },

    cancelEdit: function(t) {
      t.title = this.editedTodo.title
      this.editedTodo = null
    },

    clearCompleted: function() {
      if (confirm("确认清除全部已完成的代办事项?")) {
        this.completedTodos.map(t => t.removed = true)
        this.recycleBin.unshift(...this.completedTodos)
        this.todos = this.leftTodos
      }
    },

    clearAll: function() {
      if (confirm("确认清除全部待办事项?")) {
        this.todos.map(t => t.removed = true)
        this.recycleBin.unshift(...this.todos)
        this.todos = []
      }
    },

    // 拖拽相关方法
    dragstart: function(t) {
      this.dragIndex = t
    },

    dragenter: function(t, e) {
      if (t.preventDefault(), this.dragIndex !== e) {
        const t = this.filteredTodos[this.dragIndex]
        this.filteredTodos.splice(this.dragIndex, 1)
        this.filteredTodos.splice(e, 0, t)
        this.dragIndex = e
      }
    },

    dragover: function(t, e) {
      t.preventDefault()
    },

    // 动画相关方法
    beforeEnter(t) {
      t.classList.add("drag-enter-active")
    },

    enter(t, e) {
      let o = t.dataset.delay
      setTimeout(() => {
        this.delayTime = "1"
        t.classList.remove("drag-enter-active")
        t.classList.add("drag-enter-to")
        let o = window.ontransitionend ? "transitionend" : "webkitTransitionEnd"
        t.addEventListener(o, function i() {
          t.removeEventListener(o, i)
          e()
        })
      }, o)
    },

    afterEnter(t) {
      t.classList.remove("drag-enter-to")
    },

    instructions() {
      document.querySelector("#lyBox").style.dispaly = "block"
      layer.open({
        type: 1,
        title: false,
        closeBtn: true,
        area: ["590px", "680px"],
        shade: 0.6,
        id: "LAY_layuipro",
        resize: false,
        btn: ["会了", "已阅"],
        btnAlign: "c",
        moveType: 1,
        content: $("#lyBox"),
        success: function(t) {
          t.find(".layui-layer-btn").find(".layui-layer-btn0").attr({
            href: " ",
            target: "_blank"
          })
        }
      })
    }
  },

  // 生命周期钩子
  mounted() {
    this.show = true
    var t = this
    if (this.contorlScreen(), window.onresize = (() => {
        window.fullWidth = document.documentElement.clientWidth
        t.windowWidth = window.fullWidth
      }), !localStorage.getItem("mark") && !isMobile) {
      this.instructions()
      localStorage.setItem("mark", "true")
    } else {
      const t = new XMLHttpRequest
      const e = "https://zj.v.api.aa1.cn/api/wenan-shici/?type=json"
      t.open("GET", e)
      t.send()
      t.onreadystatechange = (e => {
        let o = t.responseText.substring(8).slice(0, -2)
        layer.msg(o, {
          time: 4000
        })
      })
    }
  },

  // 指令
  directives: {
    focus: {
      inserted: function(t) {
        t.focus()
      }
    }
  },

  // 计算属性
  computed: {
    emptyChecked: function() {
      return this.newTodoTitle.length === 0 && this.checkEmpty
    },
    leftTodos: function() {
      return this.todos.filter(function(t) {
        return !t.completed
      })
    },
    leftTodosCount: function() {
      return this.leftTodos.length
    },
    hasRemovedTodo: function() {
      return !!this.removedTodo
    },
    completedTodos: function() {
      return this.todos.filter(function(t) {
        return t.completed
      })
    },
    completedTodosCount: function() {
      return this.completedTodos.length
    },
    filteredTodos: function() {
      if (this.intention === "ongoing") return this.leftTodos
      if (this.intention === "completed") return this.completedTodos
      if (this.intention === "removed") return this.recycleBin
      return this.todos
    }
  }
})
