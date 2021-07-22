<template>
  <dialog-or-drawer :title="title" inner :visible="visible" :submiting="submiting" @close="handleClose" @submit="handleSubmit">
    <change-password-form slot="body" ref="form" v-bind="dyamicProps" />
  </dialog-or-drawer>
</template>
<script>
import ChangePasswordForm from './ChangePasswordForm'
import DialogOrDrawer from './DialogOrDrawer'
export default {
  components: { ChangePasswordForm, DialogOrDrawer },
  props: Object.assign({}, ChangePasswordForm.props, {
    visible: Boolean
  }),
  data() {
    return {
      submiting: false
    }
  },
  computed: {
    title: {
      get() {
        const label = this.field.meta ? this.field.meta.label : ''
        return `${this.$t('table.edit')} ${label}`
      }
    },
    dyamicProps: {
      get() {
        const rs = {}
        Object.keys(ChangePasswordForm.props).forEach(key => {
          this[key] && (rs[key] = this[key])
        })
        return rs
      }
    }
  },
  methods: {
    handleClose() {
      this.$refs.form.resetForm()
      this.visible && this.$emit('close', false)
    },
    handleSubmit() {
      this.submiting = true
      this.$refs.form.submit().then(() => {
        this.$emit('close', true)
      }).catch(() => {
      }).finally(() => {
        this.submiting = false
      })
    }
  }
}
</script>
