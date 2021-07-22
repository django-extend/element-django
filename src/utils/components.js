import Layout from '@/layout'

const components = {
  defaults: {
    'menu': Layout,
    'dashboard': () => import('@/views/Dashboard'),
    'django': () => import('@/components/Django')
  },
  custom: {

  },
  get(key) {
    return this.custom[key] || this.defaults[key]
  }
}
export default components
