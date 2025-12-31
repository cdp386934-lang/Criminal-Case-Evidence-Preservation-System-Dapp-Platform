#### 1. 案件创建
- 案件创建
公安机关进行创建案件，填写案件字段;创建成功后，默认创建状态在侦察中；（caseStatus =="INVESTIGATION"）
- 案件处理
创建案件成功之后，公安机关可以侦察，上传在侦察期间的证据；（evident）
- 案件提交
公安机关通过提交案件，将案件提交给法院或者结案；（caseStatus =="TRANSFER_TO_PROCURATORATE"||"COURT_TRIAL"||"CLOSED"）
ps:
    当案件状态为"TRANSFER_TO_PROCURATORATE"时，案件性质则为公诉案件;
    当案件状态为"COURT_TRIAL"时，案件性质则为自诉案件;
    当案件状态为"CLOSED"时，案件性质则为结案案件;

#### 2.证据上传阶段
公安机关上传证据：
只有在案件状态为"INVESTIGATION"时，公安机关可以上传证据；

检察官上传证据：
只有在案件状态为"TRANSFER_TO_PROCURATORATE"时，检察官可以上传证据；(前提：案件信息中prosecutorIds是当前用户的id)

律师上传证据：
案件状态是任何阶段都可以上传证据；（前提：案件信息中lawyerIds中存在当前用户id）

#### 3.查看证据阶段


后端：
我需要将对应controller和service合起来？







/***
 * Dashboard page
 * Todo
 * 我需要需要根据不同的角色显示不同的内容并设置对应路由进行跳转
 * - admin
 *   推送通知： /admin/notifications
 *   用户管理： /admin/users
 *   权限管理： /admin/permissions
 *   日志管理： /admin/logs
 *   个人中心： /admin/profile
 * 
 * - police
 *   推送通知： /police/notifications
 *   案件管理： /police/cases
 *   上传证据： /police/evidence
 *   上传诉讼： /police/appeal
 *   个人中心： /police/profile
 * 
 * - judge
 *   推送通知： /judge/notifications
 *   案件管理： /judge/cases
 *   上传证据： /judge/evidence
 *   上传质证： /judge/Objection
 *   个人中心： /judge/profile
 * 
 * - lawyer
 *   推送通知： /lawyer/notifications
 *   案件管理：/ lawyer/cases
 *   上传证据： /lawyer/evidence
 *   上传质证： /lawyer/Objection
 *   个人中心： /lawyer/profile
 * 
 * - prosecutor
 *   推送通知： /prosecutor/notifications
 *   案件管理：/ prosecutor/cases
 *   上传证据： /prosecutor/evidence
 *   上传质证： /prosecutor/Objection
 *   个人中心： /prosecutor/profile
 */

 https://git.lottery.next.js-based-Criminal-Case-Evidence-Preservation-System-Dapp-Platform.org/code/git


========================================================================
后端：
utils/blockchain.ts：更新合约对角色的授权，以及合约中获取的ABI接口；
controller/userController.ts：管理员对于用户信息的增删改查，同时用户个人可以对自己的信息进行修改；
controller/operationLogController.ts；管理员对用户操作额任何日志信息进行查看方便追踪数据流向；

案件的三个状态：
  INVESTIGATION = 'INVESTIGATION', // 侦查中
  当案件在侦察中时，police和lawyer可以上传证据；lawyer上传证据（需要新增）
  PROCURATORATE = 'PROCURATORATE', // 起诉
  当案件在起诉中时，lawyer、procurator可以上传证据，只有在这个阶段中才能进行质证（对质证进行增删改查）
  在这里进行双方质证环节；
  COURT_TRIAL = 'COURT_TRIAL', // 法院审理
  当案件在审理中时，lawyer、procurator可以上传辩护材料，只有在这个阶段中才能进行上传辩护材料（对辩护材料进行增删改查）
  在案件审理过程中，法官会对证据和辩护材料进行审查；



前端：
补充:notificationApi.ts

