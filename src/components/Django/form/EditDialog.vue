<template>
  <dialog-or-drawer :title="title" :visible="visible" :submiting="submiting" @close="handleClose" @submit="handleSubmit">
    <edit-form slot="body" ref="form" v-bind="dyamicProps" />
  </dialog-or-drawer>
</template>
<script>
import EditForm from './EditForm'
import DialogOrDrawer from './DialogOrDrawer'
export default {
  components: { EditForm, DialogOrDrawer },
  props: EditForm.props,
  data() {
    return {
      submiting: false
    }
  },
  computed: {
    title: {
      get() {
        return this.editMode ? this.$t('table.edit') : this.$t('table.add')
      }
    },
    dyamicProps: {
      get() {
        const rs = {}
        Object.keys(EditForm.props).forEach(key => {
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
