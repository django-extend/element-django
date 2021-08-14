<template>
  <el-dialog v-if="dialogStyle===1" :append-to-body="inner" :title="title" :visible="visible" @close="$emit('close')">
    <slot name="body" />
    <div slot="footer" class="dialog-footer">
      <template v-if="showSubmit">
        <el-button @click="$emit('close')">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" :loading="submiting" @click="$emit('submit')">
          {{ $t('table.confirm') }}
        </el-button>
      </template>
      <template v-else>
        <el-button @click="$emit('close')">
          {{ $t('table.close') }}
        </el-button>
      </template>
    </div>
  </el-dialog>
  <el-drawer v-else :title="title" :append-to-body="inner" :visible="visible" :size="size" @close="$emit('close')">
    <div class="drawer-body">
      <slot name="body" />
    </div>
    <div class="submit-tail">
      <template v-if="showSubmit">
        <el-button :style="{ marginRight: '8px' }" @click="$emit('close')">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" :loading="submiting" @click="$emit('submit')">{{ $t('table.confirm') }}</el-button>
      </template>
      <template v-else>
        <el-button :style="{ marginRight: '8px' }" @click="$emit('close')">{{ $t('table.close') }}</el-button>
      </template>
    </div>
  </el-drawer>
</template>
<script>
export default {
  props: {
    visible: Boolean,
    submiting: Boolean,
    inner: Boolean,
    showSubmit: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      required: true
    }
  },
  computed: {
    size: {
      get() {
        return this.inner ? '40%' : '50%'
      }
    },
    dialogStyle: {
      get() {
        return this.$store.state.settings.dialogStyle
      }
    }
  }
}
</script>
<style scoped>
.submit-tail {
  position: absolute;
  right: 0px;
  bottom: 0px;
  width: 100%;
  border-top: 1px solid rgb(233, 233, 233);
  padding: 10px 16px;
  background: rgb(255, 255, 255);
  text-align: right;
  z-index: 1;
}
/* 默认的抽屉没有滚动条 */
.el-drawer__body {
  overflow: auto;
}
/* 不预留一点位置，下面的确定框会遮住最后一条记录 */
.drawer-body {
  padding: 10px;
  padding-bottom: 40px;
}
</style>
