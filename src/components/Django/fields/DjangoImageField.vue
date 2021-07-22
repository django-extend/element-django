<template>
  <div>
    <el-upload
      action="#"
      accept="image/*"
      :auto-upload="false"
      :file-list="fileList"
      list-type="picture-card"
      :on-change="handleFileChange"
      :on-remove="handleRemove"
    >
      <i slot="default" class="el-icon-plus" />
      <div slot="file" slot-scope="{file}">
        <img
          class="el-upload-list__item-thumbnail"
          :src="file.url"
          alt=""
        >
        <span class="el-upload-list__item-actions">
          <span
            class="el-upload-list__item-preview"
            @click="handlePictureCardPreview(file)"
          >
            <i class="el-icon-zoom-in" />
          </span>
          <span
            class="el-upload-list__item-delete"
            @click="handleRemove(file)"
          >
            <i class="el-icon-delete" />
          </span>
        </span>
      </div>
    </el-upload>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
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
      dialogImageUrl: '',
      dialogVisible: false,
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
      this.fileList = []
      this.$emit('change', '')
    },
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
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
