<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :span="4" :xs="24">
        <el-card class="box-card">
          <el-input
            v-model="deptName"
            placeholder="部门名称"
            clearable
            :prefix-icon="Search"
            style="margin-bottom: 20px"
          />
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            :props="{ children: 'children', label: 'label', disabled: '' }"
            :expand-on-click-node="false"
            :filter-node-method="filterDeptNode"
            default-expand-all
            @node-click="handleDeptNodeClick"
          >
          </el-tree>
        </el-card>
      </el-col>

      <!-- 用户数据 -->
      <el-col :span="20" :xs="24">
        <el-card class="box-card">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item>
              <el-button
                type="success"
                :icon="Plus"
                @click="handleAdd"
                v-hasPerm="['sys:user:add']"
              >
                新增
              </el-button>
              <el-button
                type="danger"
                :icon="Delete"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPerm="['sys:user:delete']"
              >
                删除
              </el-button>
            </el-form-item>

            <el-form-item prop="keywords">
              <el-input
                v-model="queryParams.keywords"
                placeholder="用户名/昵称/手机号"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
              />
            </el-form-item>

            <el-form-item prop="status">
              <el-select
                v-model="queryParams.status"
                placeholder="用户状态"
                clearable
                style="width: 200px"
              >
                <el-option label="正常" value="1" />
                <el-option label="停用" value="0" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :icon="Search" @click="handleQuery">
                搜索
              </el-button>
              <el-button :icon="Refresh" @click="resetQuery"> 重置 </el-button>
              <el-button :icon="Refresh" @click="searchSyncPart"> 同步 </el-button>
            </el-form-item>
          </el-form>

          <el-table
            v-loading="loading"
            :data="userList"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column
              key="id"
              label="用户编号"
              align="center"
              prop="id"
            />
            <el-table-column
              key="username"
              label="用户名称"
              align="center"
              prop="username"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="用户昵称"
              align="center"
              prop="nickname"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="部门"
              align="center"
              prop="deptName"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="手机号码"
              align="center"
              prop="mobile"
              width="120"
            />

            <el-table-column label="状态" align="center" prop="status">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.status"
                  :inactive-value="0"
                  :active-value="1"
                  @change="handleStatusChange(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              align="center"
              prop="gmtCreate"
              width="180"
            >
            </el-table-column>
            <el-table-column label="操作" align="center" width="150">
              <template #default="scope">
                <el-button
                  type="primary"
                  :icon="Edit"
                  circle
                  plain
                  @click="handleUpdate(scope.row)"
                  v-hasPerm="['sys:user:edit']"
                >
                </el-button>
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  plain
                  @click="handleDelete(scope.row)"
                  v-hasPerm="['sys:user:delete']"
                >
                </el-button>
                <el-button
                  type="warning"
                  :icon="Lock"
                  circle
                  plain
                  @click="resetPassword(scope.row)"
                >
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination
            v-show="total > 0"
            :total="total"
            v-model:page="queryParams.pageNum"
            v-model:limit="queryParams.pageSize"
            @pagination="handleQuery"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      append-to-body
      @close="cancel"
    >
      <el-form
        ref="dataFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            :readonly="!!formData.id"
            v-model="formData.username"
            placeholder="请输入用户名"
          />
        </el-form-item>

        <el-form-item label="用户昵称" prop="nickname">
          <el-input v-model="formData.nickname" placeholder="请输入用户昵称" />
        </el-form-item>

        <el-form-item label="归属部门" prop="deptId">
          <tree-select
            v-model="formData.deptId"
            :options="deptOptions"
            placeholder="请选择归属部门"
          />
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input
            v-model="formData.mobile"
            placeholder="请输入手机号码"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="用户性别" prop="gender">
          <el-select v-model="formData.gender" placeholder="请选择">
            <el-option label="未知" :value="0" />
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="formData.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm"> 确 定 </el-button>
          <el-button @click="cancel"> 取 消 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang='ts'>
// Vue依赖
import {
  reactive,
  ref,
  unref,
  watchEffect,
  onMounted,
  getCurrentInstance,
  toRefs,
} from "vue";

// API依赖
import {
  listUserPages,
  getUserFormDetail,
  deleteUsers,
  addUser,
  updateUser,
  updateUserPart,
  searchSync,
} from "@/api/system/user";
import { listSelectDepartments } from "@/api/system/dept";
import { listRoles } from "@/api/system/role";

// 组件依赖
import { ElMessage, ElMessageBox, ElTree, ElForm } from "element-plus";
import {
  Search,
  Plus,
  Edit,
  Refresh,
  Delete,
  Lock,
} from "@element-plus/icons-vue";
import TreeSelect from "@/components/TreeSelect/index.vue";
import {
  UserItem,
  UserQueryParam,
  UserFormData,
  Option,
  RoleItem,
  Dialog
} from "@/types";

// DOM元素的引用声明定义
const deptTreeRef = ref(ElTree); // 变量名和DOM的ref属性值一致
const queryFormRef = ref(ElForm);
const dataFormRef = ref(ElForm);

const { proxy }: any = getCurrentInstance();

const state = reactive({
  // 遮罩层
  loading: true,
  // 选中数组
  ids: [],
  // 非单个禁用
  single: true,
  // 非多个禁用
  multiple: true,
  // 总条数
  total: 0,
  // 用户分页数据
  userList: [] as UserItem[],
  // 弹窗属性
  dialog: {
    visible: false,
  } as Dialog,
  deptName: undefined,
  // 部门树选项
  deptOptions: [] as Option[],
  // 部门名称
  // 性别状态字典
  genderOptions: [] as any[],
  // 角色选项
  roleOptions: [] as RoleItem[],
  // 表单参数
  formData: {} as UserFormData,
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
  } as UserQueryParam,
  // 表单校验
  rules: {
    username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
    nickname: [
      { required: true, message: "用户昵称不能为空", trigger: "blur" },
    ],
    deptId: [{ required: true, message: "归属部门不能为空", trigger: "blur" }],
    roleId: [{ required: true, message: "用户角色不能为空", trigger: "blur" }],
    email: [
      {
        pattern: /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/,
        message: "请输入正确的邮箱地址",
        trigger: "blur",
      },
    ],
    mobile: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: "blur",
      },
    ],
  },
});

const {
  loading,
  single,
  multiple,
  queryParams,
  userList,
  total,
  dialog,
  formData,
  rules,
  deptName,
  deptOptions,
  roleOptions,
} = toRefs(state);

/**
 * 部门筛选
 */
watchEffect(
  () => {
    deptTreeRef.value.filter(state.deptName);
  },
  {
    flush: "post", // watchEffect会在DOM挂载或者更新之前就会触发，此属性控制在DOM元素更新后运行
  }
);

function filterDeptNode(value: string, data: any) {
  if (!value) {
    return true;
  }
  return data.label.indexOf(value) !== -1;
}

/**
 * 部门树节点点击
 */
function handleDeptNodeClick(data: { [key: string]: any }) {
  state.queryParams.deptId = data.id;
  handleQuery();
}

/**
 * 加载角色数据
 */
async function loadRoleOptions() {
  listRoles().then((response) => {
    state.roleOptions = response.data;
  });
}

/**
 * 用户状态修改
 */
function handleStatusChange(row: { [key: string]: any }) {
  const text = row.status === 1 ? "启用" : "停用";
  ElMessageBox.confirm(
    "确认要" + text + "" + row.username + "用户吗?",
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      return updateUserPart(row.id, { status: row.status });
    })
    .then(() => {
      ElMessage.success(text + "成功");
    })
    .catch(() => {
      row.status = row.status === 1 ? 0 : 1;
    });
}

/**
 * 用户查询
 **/
function handleQuery() {
  state.loading = true;
  listUserPages(state.queryParams).then(({ data }) => {
    state.userList = data.list;
    state.total = data.total;
    state.loading = false;
  });
}

function searchSyncPart() {
  searchSync();
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  handleQuery();
}

/**
 * 表格行选中事件
 */
function handleSelectionChange(selection: any) {
  state.ids = selection.map((item: any) => item.id);
  state.single = selection.length !== 1;
  state.multiple = !selection.length;
}

/**
 * 密码重置
 */
function resetPassword(row: { [key: string]: any }) {
  ElMessageBox.prompt(
    "请输入用户「" + row.username + "」的新密码",
    "重置密码",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
    }
  )
    .then(({ value }) => {
      if (!value) {
        ElMessage.warning("请输入新密码");
        return false;
      }
      updateUserPart(row.id, {
        password: value,
      }).then(() => {
        ElMessage.success("修改成功，新密码是：" + value);
      });
    })
    .catch(() => {});
}

/**
 * 添加用户
 **/
async function handleAdd() {
  await loadDeptOptions();
  await loadRoleOptions();
  state.dialog = {
    title: "添加用户",
    visible: true,
  };
}

/**
 * 修改用户
 **/
async function handleUpdate(row: { [key: string]: any }) {
  const userId = row.id || state.ids;
  await loadDeptOptions();
  await loadRoleOptions();
  state.dialog = {
    title: "修改用户",
    visible: true,
  };
  getUserFormDetail(userId).then(({ data }) => {
    state.formData = data;
  });
}

/**
 * 表单提交
 */
function submitForm() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      const userId = state.formData.id;
      if (userId) {
        updateUser(userId, state.formData).then(() => {
          ElMessage.success("修改用户成功");
          state.dialog.visible = false;
          resetForm();
          handleQuery();
        });
      } else {
        addUser(state.formData).then((response: any) => {
          ElMessage.success("新增用户成功");
          state.dialog.visible = false;
          resetForm();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 重置表单
 */
function resetForm() {
  state.formData.id = undefined;
  dataFormRef.value.resetFields();
}

/**
 * 删除用户
 */
function handleDelete(row: { [key: string]: any }) {
  const userIds = row.id || state.ids.join(",");
  ElMessageBox.confirm(
    "是否确认删除用户编号为「" + userIds + "」的数据项?",
    "警告",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(function () {
      deleteUsers(userIds).then(() => {
        ElMessage.success("删除成功");
        handleQuery();
      });
    })
    .catch(() => ElMessage.info("已取消删除"));
}

/**
 * 取消
 */
function cancel() {
  state.dialog.visible = false;
  resetForm();
}

/**
 * 加载部门
 */
async function loadDeptOptions() {
  listSelectDepartments().then((response) => {
    state.deptOptions = response.data;
  });
}

/**
 * 加载性别字典
 */
function loadGenderOptions() {
  proxy.$listDictsByCode("gender").then((response: any) => {
    state.genderOptions = response?.data;
  });
}

/**
 * 初始化数据
 */
function loadData() {
  // 初始化性别字典
  loadGenderOptions();
  // 初始化部门
  loadDeptOptions();
  // 初始化用户列表数据
  handleQuery();
}

onMounted(() => {
  loadData();
});
</script>
<style lang="scss" scoped>
</style>
