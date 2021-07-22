<template>
  <el-upload
    action=""
    :auto-upload="false"
    :file-list="fileList"
    :on-change="handleFileChange"
    :on-remove="handleRemove"
  >
    <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
  </el-upload>
</template>
<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [String, Object],
      default: null
    },
    canDelete: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      fileList: []
    }
  },
  watch: {
    value(val) {
      this.fileList = this.getFileList(val)
    }
  },
  methods: {
    getNameFromURI(value) {
      const url = decodeURI(value)
      const index = url.lastIndexOf('/')
      return url.substr(index + 1)
    },
    getFileList(value) {
      if (!value) {
        return []
      }
      if (value instanceof Object) {
        return [value]
      }
      return [
        {
          uid: 1,
          name: this.getNameFromURI(value),
          url: value
        }
      ]
    },
    handleFileChange(file, files) {
      this.fileList = files.slice(-1)
      this.$emit('change', file)
    },
    handleRemove() {
      this.$emit('change', '')
    }
  }
}
</script>
<style lang="scss">
// 去除动画效果
.el-upload-list__item {
  transition: none !important;
}
</style>
