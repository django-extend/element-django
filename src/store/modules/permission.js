import { constantRoutes, asyncRoutes } from '@/router'
import components from '@/utils/components'

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*', redirect: '/404', hidden: true
}
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const getComponent = (item) => {
  if (typeof item.component === 'string') {
    // 通过服务端返回的字典配置加载组件
    return components.get(item.component)
  }
  // 本地自定义组件直接返回
  return item.component
}

const generator = (routerMap, parent) => {
  return routerMap.map(item => {
    if (item.name === 'dashboard') {
      return {
        path: '/',
        component: components.get('menu'),
        redirect: '/dashboard',
        children: [
          {
            path: 'dashboard',
            component: getComponent(item),
            name: 'Dashboard',
            meta: { title: item.meta.title, icon: item.meta.icon, affix: true }
          }
        ]
      }
    }
    const currentRouter = Object.assign({}, item)
    const itemPath = item.path || `${parent && parent.path || ''}/${item.key}`
    const itemComponent = getComponent(item)
    currentRouter.path = itemPath
    currentRouter.component = itemComponent
    if (item.children && item.children.length > 0) {
      currentRouter.children = generator(item.children, currentRouter)
    }
    return currentRouter
  })
}

const actions = {
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      // let accessedRoutes
      // if (roles.includes('admin')) {
      //   accessedRoutes = asyncRoutes || []
      // } else {
      //   accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      // }

      // 上面的代码是原项目代码，逻辑是根据服务器返回的rules去本地筛选菜单
      // 这里改成和antd一样的逻辑，菜单从服务端读取
      let accessedRoutes = generator(menus)
      accessedRoutes.push(notFoundRouter)
      accessedRoutes = accessedRoutes.concat(asyncRoutes)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
