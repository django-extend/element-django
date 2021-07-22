<template>
  <dialog-or-drawer :title="$t('table.view')" :visible="visible" :show-submit="false" @close="handleClose">
    <view-form slot="body" v-bind="dyamicProps" />
  </dialog-or-drawer>
</template>
<script>
import ViewForm from './ViewForm'
import DialogOrDrawer from './DialogOrDrawer'
export default {
  components: { ViewForm, DialogOrDrawer },
  props: Object.assign({}, ViewForm.props, {
    visible: Boolean
  }),
  computed: {
    dyamicProps: {
      get() {
        const rs = {}
        Object.keys(ViewForm.props).forEach(key => {
          this[key] && (rs[key] = this[key])
        })
        return rs
      }
    }
  },
  methods: {
    handleClose() {
      this.visible && this.$emit('update:visible', false)
    }
  }
}
</script>
