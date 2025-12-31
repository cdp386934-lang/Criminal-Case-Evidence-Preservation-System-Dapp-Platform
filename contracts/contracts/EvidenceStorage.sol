// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceStorage
 * @dev 基础核心合约：定义所有结构体、枚举、状态变量、通用函数和事件，作为所有角色合约的父合约
 */
contract EvidenceStorage {
    // ============ 枚举定义 ============
    enum EvidenceType { Physical, Documentary, Testimony, AudioVideo, Electronic, Other }
    enum InvestigationStatus { Investigating, Concluded, Transferred }
    enum LitigationType { PublicProsecution, Other }
    enum ReviewConclusion { Prosecute, NotProsecute }
    enum EvidenceVisibility { Public, Confidential }
    enum CaseAcceptanceStatus { Pending, Accepted, Rejected }
    enum CaseViewStage { Investigation, Review, Trial, Judgment }
    enum EvidenceAdmissibility { Pending, Admitted, Rejected }

    // ============ 结构体定义 ============
    struct Evidence {
        uint256 evidenceId;
        string hash;
        address uploader;
        uint256 timestamp;
        bool exists;
    }

    struct Correction {
        uint256 originalEvidenceId;
        uint256 correctionEvidenceId;
        address corrector;
        uint256 timestamp;
        string reason;
    }

    struct Case {
        string caseId;
        string basicInfo;
        address creator;
        uint256 createTime;
        InvestigationStatus status;
        bool exists;
        bool withdrawn;
    }

    struct EvidenceModificationLog {
        uint256 evidenceId;
        address modifierAddress;
        uint256 modifyTime;
        string modificationReason;
        string oldHash;
        string newHash;
    }

    struct LitigationApplication {
        string caseId;
        LitigationType litigationType;
        address applicant;
        uint256 applicationTime;
        string caseFileHash;
        uint256[] evidenceList;
        address assignedProsecutor;
        address assignedLawyer;
        address plaintiffLawyer;
        address defendantLawyer;
        bool exists;
    }

    struct SupplementaryInvestigation {
        string caseId;
        address prosecutor;
        uint256 returnTime;
        string opinionLetterHash;
        string reason;
        bool exists;
    }

    struct ReviewResult {
        string caseId;
        address prosecutor;
        ReviewConclusion conclusion;
        uint256 reviewTime;
        string conclusionDocumentHash;
        bool exists;
    }

    struct ProsecutionTeam {
        address leadProsecutor;
        address[] teamMembers;
        bool confirmed;
    }

    struct EvidenceCrossExamination {
        uint256 evidenceId;
        string caseId;
        address prosecutor;
        uint256 submitTime;
        string opinionHash;
        bool exists;
    }

    struct ProsecutionOpinion {
        string caseId;
        address prosecutor;
        uint256 submitTime;
        string opinionHash;
        bool exists;
    }

    struct AccessRecord {
        string caseId;
        address lawyer;
        uint256 accessTime;
        string watermarkedFileHash;
        bool exists;
    }

    struct ConfidentialEvidenceApplication {
        string caseId;
        uint256 evidenceId;
        address lawyer;
        uint256 applicationTime;
        string reason;
        bool approved;
        address approver;
        uint256 approvalTime;
        bool exists;
    }

    struct PreTrialOpinion {
        string caseId;
        address lawyer;
        uint256 submitTime;
        string opinionHash;
        bool exists;
    }

    struct LawyerCrossExamination {
        uint256 evidenceId;
        string caseId;
        address lawyer;
        uint256 submitTime;
        string opinionHash;
        bool exists;
    }

    struct TrialTranscript {
        string caseId;
        address lawyer;
        uint256 submitTime;
        string transcriptHash;
        bool exists;
    }

    struct EvidenceObjection {
        string caseId;
        uint256 evidenceId;
        address lawyer;
        address prosecutor;
        uint256 submitTime;
        string objectionHash;
        bool exists;
    }

    struct ProsecutorCommunication {
        string caseId;
        address lawyer;
        address prosecutor;
        uint256 communicationTime;
        string communicationHash;
        bool exists;
    }

    struct TrialSchedule {
        string caseId;
        uint256 trialTime;
        string courtroom;
        address[] panelMembers;
        bool exists;
    }

    struct CaseViewPermission {
        string caseId;
        address user;
        CaseViewStage[] allowedStages;
        bool exists;
    }

    struct EvidenceAdmissibilityDecision {
        uint256 evidenceId;
        string caseId;
        address judge;
        EvidenceAdmissibility decision;
        uint256 decisionTime;
        string reason;
        bool exists;
    }

    struct Judgment {
        string caseId;
        address judge;
        uint256 judgmentTime;
        string judgmentResult;
        string[] legalProvisions;
        string judgmentDocumentHash;
        bool exists;
    }

    struct DeliveryReceipt {
        string caseId;
        address recipient;
        uint256 deliveryTime;
        string receiptHash;
        bool exists;
    }

    // ============ 状态变量 ============
    mapping(string => uint256[]) public caseToEvidences;
    mapping(uint256 => Evidence) public evidences;
    mapping(uint256 => Correction[]) public evidenceCorrections;
    mapping(uint256 => Evidence[]) public evidenceHistory;
    mapping(uint256 => EvidenceType) public evidenceTypes;
    mapping(uint256 => EvidenceModificationLog[]) public evidenceModificationLogs;
    mapping(string => Case) public cases;
    mapping(string => LitigationApplication) public litigationApplications;
    mapping(string => SupplementaryInvestigation[]) public supplementaryInvestigations;
    mapping(string => ReviewResult) public reviewResults;
    mapping(string => ProsecutionTeam) public prosecutionTeams;
    mapping(uint256 => EvidenceCrossExamination[]) public evidenceCrossExaminations;
    mapping(string => ProsecutionOpinion) public prosecutionOpinions;
    mapping(uint256 => EvidenceVisibility) public evidenceVisibilities;
    mapping(string => AccessRecord[]) public accessRecords;
    mapping(uint256 => ConfidentialEvidenceApplication[]) public confidentialEvidenceApplications;
    mapping(string => PreTrialOpinion[]) public preTrialOpinions;
    mapping(uint256 => LawyerCrossExamination[]) public lawyerCrossExaminations;
    mapping(string => TrialTranscript[]) public trialTranscripts;
    mapping(uint256 => EvidenceObjection[]) public evidenceObjections;
    mapping(string => ProsecutorCommunication[]) public prosecutorCommunications;
    mapping(string => CaseAcceptanceStatus) public caseAcceptanceStatuses;
    mapping(string => TrialSchedule) public trialSchedules;
    mapping(string => mapping(address => CaseViewPermission)) public caseViewPermissions;
    mapping(uint256 => EvidenceAdmissibilityDecision) public evidenceAdmissibilityDecisions;
    mapping(string => Judgment) public judgments;
    mapping(string => DeliveryReceipt[]) public deliveryReceipts;

    // 角色权限映射
    mapping(address => bool) public judges;
    mapping(address => bool) public prosecutors;
    mapping(address => bool) public lawyers;
    mapping(address => bool) public polices;

    // 计数器
    uint256 public caseCounter;
    uint256 public evidenceCounter;

    // 管理员地址
    address public admin;

    // ============ 事件定义 ============
    event CorrectionAdded(uint256 indexed originalEvidenceId, uint256 indexed correctionEvidenceId, address indexed corrector, uint256 timestamp);
    event RoleGranted(address indexed account, string role);
    event RoleRevoked(address indexed account, string role);
    event CaseCreated(string indexed caseId, address indexed creator, uint256 createTime);
    event CaseStatusUpdated(string indexed caseId, InvestigationStatus newStatus, address indexed updater, uint256 updateTime);
    event CaseWithdrawn(string indexed caseId, address indexed withdrawer, uint256 withdrawTime);
    event EvidenceUploadedByPolice(uint256 indexed evidenceId, string indexed caseId, string hash, EvidenceType evidenceType, address indexed uploader, uint256 timestamp);
    event EvidenceModifiedByPolice(uint256 indexed evidenceId, string indexed caseId, string oldHash, string newHash, string modificationReason, address indexed modifierAddress, uint256 modifyTime);
    event EvidencePackageTransferred(string indexed caseId, uint256[] evidenceIds, address indexed transferrer, address indexed targetProsecutor, uint256 transferTime);
    event LitigationApplicationSubmitted(string indexed caseId, LitigationType litigationType, address indexed applicant, uint256 applicationTime);
    event ProsecutorAssigned(string indexed caseId, address indexed prosecutor, address indexed assigner);
    event LawyerAssigned(string indexed caseId, address indexed lawyer, address indexed assigner);
    event SupplementaryInvestigationReturned(string indexed caseId, address indexed prosecutor, string opinionLetterHash, uint256 returnTime);
    event ReviewConclusionGenerated(string indexed caseId, address indexed prosecutor, ReviewConclusion conclusion, uint256 reviewTime);
    event ProsecutionTeamConfirmed(string indexed caseId, address indexed leadProsecutor, address[] teamMembers, address indexed confirmer);
    event LawyerInfoConfirmed(string indexed caseId, address plaintiffLawyer, address defendantLawyer, address indexed confirmer);
    event EvidenceCrossExaminationSubmitted(uint256 indexed evidenceId, string indexed caseId, address indexed prosecutor, string opinionHash, uint256 submitTime);
    event ProsecutionOpinionSubmitted(string indexed caseId, address indexed prosecutor, string opinionHash, uint256 submitTime);
    event CaseFileAccessed(string indexed caseId, address indexed lawyer, string watermarkedFileHash, uint256 accessTime);
    event ConfidentialEvidenceApplicationSubmitted(uint256 indexed evidenceId, string indexed caseId, address indexed lawyer, uint256 applicationTime);
    event ConfidentialEvidenceApplicationApproved(uint256 indexed evidenceId, string indexed caseId, address indexed approver, uint256 approvalTime);
    event PreTrialOpinionSubmitted(string indexed caseId, address indexed lawyer, string opinionHash, uint256 submitTime);
    event LawyerCrossExaminationSubmitted(uint256 indexed evidenceId, string indexed caseId, address indexed lawyer, string opinionHash, uint256 submitTime);
    event TrialTranscriptSubmitted(string indexed caseId, address indexed lawyer, string transcriptHash, uint256 submitTime);
    event EvidenceObjectionSubmitted(uint256 indexed evidenceId, string indexed caseId, address indexed lawyer, address prosecutor, string objectionHash, uint256 submitTime);
    event ProsecutorCommunicationRecorded(string indexed caseId, address indexed lawyer, address indexed prosecutor, string communicationHash, uint256 communicationTime);
    event ProsecutionEvidenceSubmitted(string indexed caseId, address indexed lawyer, uint256 indexed evidenceId, uint256 submitTime);
    event DefenseEvidenceSubmitted(string indexed caseId, address indexed lawyer, uint256 indexed evidenceId, uint256 submitTime);
    event CaseAcceptanceReviewed(string indexed caseId, address indexed judge, CaseAcceptanceStatus status, uint256 reviewTime);
    event TrialScheduleAllocated(string indexed caseId, address indexed judge, uint256 trialTime, string courtroom, uint256 allocateTime);
    event EvidenceDisclosureScopeApproved(string indexed caseId, uint256[] evidenceIds, address indexed judge, uint256 approveTime);
    event CaseViewPermissionAllocated(string indexed caseId, address indexed user, CaseViewStage[] stages, address indexed judge, uint256 allocateTime);
    event TrialTranscriptGenerated(string indexed caseId, address indexed judge, string transcriptHash, uint256 generateTime);
    event EvidenceAdmissibilityDecided(uint256 indexed evidenceId, string indexed caseId, address indexed judge, EvidenceAdmissibility decision, uint256 decisionTime);
    event JudgmentGenerated(string indexed caseId, address indexed judge, string judgmentDocumentHash, uint256 judgmentTime);
    event JudgmentDelivered(string indexed caseId, address indexed recipient, string receiptHash, uint256 deliveryTime);

    // ============ 修饰符 ============
    modifier onlyAdmin() {
        require(msg.sender == admin, "BaseEvidenceStorage: Only admin can call this function");
        _;
    }

    modifier onlyJudge() {
        require(judges[msg.sender], "BaseEvidenceStorage: Only judge can call this function");
        _;
    }

    modifier onlyProsecutor() {
        require(prosecutors[msg.sender], "BaseEvidenceStorage: Only prosecutor can call this function");
        _;
    }

    modifier onlyLawyer() {
        require(lawyers[msg.sender], "BaseEvidenceStorage: Only lawyer can call this function");
        _;
    }

    modifier onlyPolice() {
        require(polices[msg.sender], "BaseEvidenceStorage: Only police can call this function");
        _;
    }

    // ============ 构造函数 ============
    constructor() {
        admin = msg.sender;
        evidenceCounter = 0;
        caseCounter = 0;
    }

    // ============ 通用辅助函数 ============
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k--;
            bstr[k] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    // ============ 通用查询函数 ============
    function getEvidence(uint256 evidenceId) public view returns (string memory hash, address uploader, uint256 timestamp) {
        require(evidences[evidenceId].exists, "BaseEvidenceStorage: Evidence does not exist");
        Evidence memory evidence = evidences[evidenceId];
        return (evidence.hash, evidence.uploader, evidence.timestamp);
    }

    function getEvidenceHistory(uint256 evidenceId) public view returns (uint256[] memory evidenceIds, string[] memory hashes, address[] memory uploaders, uint256[] memory timestamps) {
        require(evidences[evidenceId].exists, "BaseEvidenceStorage: Evidence does not exist");
        Evidence[] memory history = evidenceHistory[evidenceId];
        uint256 length = history.length;
        evidenceIds = new uint256[](length);
        hashes = new string[](length);
        uploaders = new address[](length);
        timestamps = new uint256[](length);
        for (uint256 i = 0; i < length; i++) {
            evidenceIds[i] = history[i].evidenceId;
            hashes[i] = history[i].hash;
            uploaders[i] = history[i].uploader;
            timestamps[i] = history[i].timestamp;
        }
        return (evidenceIds, hashes, uploaders, timestamps);
    }

    function getCaseEvidences(string memory caseId) public view returns (uint256[] memory) {
        return caseToEvidences[caseId];
    }

    function getCorrections(uint256 evidenceId) public view returns (uint256[] memory originalIds, uint256[] memory correctionIds, address[] memory correctors, uint256[] memory timestamps, string[] memory reasons) {
        require(evidences[evidenceId].exists, "BaseEvidenceStorage: Evidence does not exist");
        Correction[] memory corrections = evidenceCorrections[evidenceId];
        uint256 length = corrections.length;
        originalIds = new uint256[](length);
        correctionIds = new uint256[](length);
        correctors = new address[](length);
        timestamps = new uint256[](length);
        reasons = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            originalIds[i] = corrections[i].originalEvidenceId;
            correctionIds[i] = corrections[i].correctionEvidenceId;
            correctors[i] = corrections[i].corrector;
            timestamps[i] = corrections[i].timestamp;
            reasons[i] = corrections[i].reason;
        }
        return (originalIds, correctionIds, correctors, timestamps, reasons);
    }

    function verifyEvidence(uint256 evidenceId, string memory hash) public view returns (bool) {
        require(evidences[evidenceId].exists, "BaseEvidenceStorage: Evidence does not exist");
        return keccak256(bytes(evidences[evidenceId].hash)) == keccak256(bytes(hash));
    }

    function getCase(string memory caseId) public view returns (string memory basicInfo, address creator, uint256 createTime, InvestigationStatus status, bool withdrawn) {
        require(cases[caseId].exists, "BaseEvidenceStorage: Case does not exist");
        Case memory caseInfo = cases[caseId];
        return (caseInfo.basicInfo, caseInfo.creator, caseInfo.createTime, caseInfo.status, caseInfo.withdrawn);
    }

    function getEvidenceType(uint256 evidenceId) public view returns (EvidenceType) {
        require(evidences[evidenceId].exists, "BaseEvidenceStorage: Evidence does not exist");
        return evidenceTypes[evidenceId];
    }

    function getEvidenceModificationLogs(uint256 evidenceId) public view returns (address[] memory modifiers, uint256[] memory modifyTimes, string[] memory modificationReasons, string[] memory oldHashes, string[] memory newHashes) {
        require(evidences[evidenceId].exists, "BaseEvidenceStorage: Evidence does not exist");
        EvidenceModificationLog[] memory logs = evidenceModificationLogs[evidenceId];
        uint256 length = logs.length;
        modifiers = new address[](length);
        modifyTimes = new uint256[](length);
        modificationReasons = new string[](length);
        oldHashes = new string[](length);
        newHashes = new string[](length);
        for (uint256 i = 0; i < length; i++) {
            modifiers[i] = logs[i].modifierAddress;
            modifyTimes[i] = logs[i].modifyTime;
            modificationReasons[i] = logs[i].modificationReason;
            oldHashes[i] = logs[i].oldHash;
            newHashes[i] = logs[i].newHash;
        }
        return (modifiers, modifyTimes, modificationReasons, oldHashes, newHashes);
    }

    function getLitigationApplication(string memory caseId) public view returns (LitigationType litigationType, address applicant, uint256 applicationTime, string memory caseFileHash, uint256[] memory evidenceList, address assignedProsecutor, address assignedLawyer, address plaintiffLawyer, address defendantLawyer) {
        require(litigationApplications[caseId].exists, "BaseEvidenceStorage: Litigation application does not exist");
        LitigationApplication memory application = litigationApplications[caseId];
        return (
            application.litigationType,
            application.applicant,
            application.applicationTime,
            application.caseFileHash,
            application.evidenceList,
            application.assignedProsecutor,
            application.assignedLawyer,
            application.plaintiffLawyer,
            application.defendantLawyer
        );
    }

    // ============ 角色验证通用函数 ============
    function isJudge(address account) public view returns (bool) { return judges[account]; }
    function isProsecutor(address account) public view returns (bool) { return prosecutors[account]; }
    function isLawyer(address account) public view returns (bool) { return lawyers[account]; }
    function isPolice(address account) public view returns (bool) { return polices[account]; }
}

/**
 * @title AdminFunctions
 * @dev 管理员专属功能合约：仅负责角色权限的授予/撤销
 */
contract AdminFunctions is EvidenceStorage {
    // 授予法官权限
    function setJudge(address judgeAddress) public onlyAdmin {
        require(judgeAddress != address(0), "AdminFunctions: Invalid address");
        judges[judgeAddress] = true;
        emit RoleGranted(judgeAddress, "judge");
    }

    // 授予检察官权限
    function setProsecutor(address prosecutorAddress) public onlyAdmin {
        require(prosecutorAddress != address(0), "AdminFunctions: Invalid address");
        prosecutors[prosecutorAddress] = true;
        emit RoleGranted(prosecutorAddress, "prosecutor");
    }

    // 授予律师权限
    function setLawyer(address lawyerAddress) public onlyAdmin {
        require(lawyerAddress != address(0), "AdminFunctions: Invalid address");
        lawyers[lawyerAddress] = true;
        emit RoleGranted(lawyerAddress, "lawyer");
    }

    // 授予公安机关权限
    function setPolice(address policeAddress) public onlyAdmin {
        require(policeAddress != address(0), "AdminFunctions: Invalid address");
        polices[policeAddress] = true;
        emit RoleGranted(policeAddress, "police");
    }

    // 撤销法官权限
    function revokeJudge(address judgeAddress) public onlyAdmin {
        judges[judgeAddress] = false;
        emit RoleRevoked(judgeAddress, "judge");
    }

    // 撤销检察官权限
    function revokeProsecutor(address prosecutorAddress) public onlyAdmin {
        prosecutors[prosecutorAddress] = false;
        emit RoleRevoked(prosecutorAddress, "prosecutor");
    }

    // 撤销律师权限
    function revokeLawyer(address lawyerAddress) public onlyAdmin {
        lawyers[lawyerAddress] = false;
        emit RoleRevoked(lawyerAddress, "lawyer");
    }

    // 撤销公安机关权限
    function revokePolice(address policeAddress) public onlyAdmin {
        polices[policeAddress] = false;
        emit RoleRevoked(policeAddress, "police");
    }
}

/**
 * @title PoliceFunctions
 * @dev 公安机关专属功能合约：立案侦查、证据管理、诉讼发起相关操作
 */
contract PoliceFunctions is EvidenceStorage {
    // 创建立案
    function createCase(string memory basicInfo) public onlyPolice returns (string memory) {
        require(bytes(basicInfo).length > 0, "PoliceFunctions: Basic info cannot be empty");
        caseCounter++;
        string memory caseId = string(abi.encodePacked("CASE-", uint2str(caseCounter)));
        cases[caseId] = Case({
            caseId: caseId,
            basicInfo: basicInfo,
            creator: msg.sender,
            createTime: block.timestamp,
            status: InvestigationStatus.Investigating,
            exists: true,
            withdrawn: false
        });
        emit CaseCreated(caseId, msg.sender, block.timestamp);
        return caseId;
    }

    // 更新侦查状态
    function updateInvestigationStatus(string memory caseId, InvestigationStatus newStatus) public onlyPolice {
        require(cases[caseId].exists, "PoliceFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "PoliceFunctions: Case has been withdrawn");
        cases[caseId].status = newStatus;
        emit CaseStatusUpdated(caseId, newStatus, msg.sender, block.timestamp);
    }

    // 撤回立案
    function withdrawCase(string memory caseId) public onlyPolice {
        require(cases[caseId].exists, "PoliceFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "PoliceFunctions: Case has already been withdrawn");
        require(cases[caseId].creator == msg.sender, "PoliceFunctions: Only case creator can withdraw");
        cases[caseId].withdrawn = true;
        emit CaseWithdrawn(caseId, msg.sender, block.timestamp);
    }

    // 上传/分类归档证据
    function uploadEvidence(string memory caseId, string memory hash, EvidenceType evidenceType, EvidenceVisibility visibility) public onlyPolice returns (uint256) {
        require(cases[caseId].exists, "PoliceFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "PoliceFunctions: Case has been withdrawn");
        require(bytes(hash).length > 0, "PoliceFunctions: Hash cannot be empty");
        
        evidenceCounter++;
        uint256 newEvidenceId = evidenceCounter;
        Evidence memory newEvidence = Evidence({
            evidenceId: newEvidenceId,
            hash: hash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        evidences[newEvidenceId] = newEvidence;
        evidenceTypes[newEvidenceId] = evidenceType;
        evidenceVisibilities[newEvidenceId] = visibility;
        caseToEvidences[caseId].push(newEvidenceId);
        evidenceHistory[newEvidenceId].push(newEvidence);
        
        emit EvidenceUploadedByPolice(newEvidenceId, caseId, hash, evidenceType, msg.sender, block.timestamp);
        return newEvidenceId;
    }

    // 编辑/补充证据
    function modifyEvidence(uint256 evidenceId, string memory caseId, string memory newHash, string memory modificationReason) public onlyPolice returns (bool) {
        require(evidences[evidenceId].exists, "PoliceFunctions: Evidence does not exist");
        require(cases[caseId].exists, "PoliceFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "PoliceFunctions: Case has been withdrawn");
        require(bytes(newHash).length > 0, "PoliceFunctions: Hash cannot be empty");
        require(bytes(modificationReason).length > 0, "PoliceFunctions: Modification reason cannot be empty");
        
        string memory oldHash = evidences[evidenceId].hash;
        evidenceHistory[evidenceId].push(evidences[evidenceId]);
        
        evidences[evidenceId].hash = newHash;
        evidences[evidenceId].timestamp = block.timestamp;
        
        evidenceModificationLogs[evidenceId].push(EvidenceModificationLog({
            evidenceId: evidenceId,
            modifierAddress: msg.sender,
            modifyTime: block.timestamp,
            modificationReason: modificationReason,
            oldHash: oldHash,
            newHash: newHash
        }));
        
        emit EvidenceModifiedByPolice(evidenceId, caseId, oldHash, newHash, modificationReason, msg.sender, block.timestamp);
        return true;
    }

    // 打包移送证据至检察院
    function transferEvidencePackage(string memory caseId, uint256[] memory evidenceIds, address targetProsecutor) public onlyPolice {
        require(cases[caseId].exists, "PoliceFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "PoliceFunctions: Case has been withdrawn");
        require(prosecutors[targetProsecutor], "PoliceFunctions: Target address is not a prosecutor");
        require(evidenceIds.length > 0, "PoliceFunctions: Evidence list cannot be empty");
        
        uint256[] memory caseEvidenceIds = caseToEvidences[caseId];
        for (uint256 i = 0; i < evidenceIds.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < caseEvidenceIds.length; j++) {
                if (caseEvidenceIds[j] == evidenceIds[i]) {
                    found = true;
                    break;
                }
            }
            require(found, "PoliceFunctions: Evidence does not belong to this case");
        }
        
        emit EvidencePackageTransferred(caseId, evidenceIds, msg.sender, targetProsecutor, block.timestamp);
    }

    // 提交移送审查起诉申请
    function submitLitigationApplication(string memory caseId, LitigationType litigationType, string memory caseFileHash, uint256[] memory evidenceList) public onlyPolice {
        require(cases[caseId].exists, "PoliceFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "PoliceFunctions: Case has been withdrawn");
        require(!litigationApplications[caseId].exists, "PoliceFunctions: Litigation application already exists");
        require(bytes(caseFileHash).length > 0, "PoliceFunctions: Case file hash cannot be empty");
        require(evidenceList.length > 0, "PoliceFunctions: Evidence list cannot be empty");
        
        uint256[] memory caseEvidenceIds = caseToEvidences[caseId];
        for (uint256 i = 0; i < evidenceList.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < caseEvidenceIds.length; j++) {
                if (caseEvidenceIds[j] == evidenceList[i]) {
                    found = true;
                    break;
                }
            }
            require(found, "PoliceFunctions: Evidence does not belong to this case");
        }
        
        litigationApplications[caseId] = LitigationApplication({
            caseId: caseId,
            litigationType: litigationType,
            applicant: msg.sender,
            applicationTime: block.timestamp,
            caseFileHash: caseFileHash,
            evidenceList: evidenceList,
            assignedProsecutor: address(0),
            assignedLawyer: address(0),
            plaintiffLawyer: address(0),
            defendantLawyer: address(0),
            exists: true
        });
        
        emit LitigationApplicationSubmitted(caseId, litigationType, msg.sender, block.timestamp);
    }

    // 指定检察官（公诉案件）
    function assignProsecutor(string memory caseId, address prosecutorAddress) public onlyPolice {
        require(litigationApplications[caseId].exists, "PoliceFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "PoliceFunctions: Only for public prosecution cases");
        require(prosecutors[prosecutorAddress], "PoliceFunctions: Address is not a prosecutor");
        
        litigationApplications[caseId].assignedProsecutor = prosecutorAddress;
        emit ProsecutorAssigned(caseId, prosecutorAddress, msg.sender);
    }

    // 指定律师（公诉案件）
    function assignLawyerForPublicProsecution(string memory caseId, address lawyerAddress) public onlyPolice {
        require(litigationApplications[caseId].exists, "PoliceFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "PoliceFunctions: Only for public prosecution cases");
        require(lawyers[lawyerAddress], "PoliceFunctions: Address is not a lawyer");
        
        litigationApplications[caseId].assignedLawyer = lawyerAddress;
        emit LawyerAssigned(caseId, lawyerAddress, msg.sender);
    }

    // 指定原被告律师（其他诉讼）
    function assignLawyersForOtherLitigation(string memory caseId, address plaintiffLawyerAddress, address defendantLawyerAddress) public onlyPolice {
        require(litigationApplications[caseId].exists, "PoliceFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.Other, "PoliceFunctions: Only for other litigation cases");
        require(lawyers[plaintiffLawyerAddress], "PoliceFunctions: Plaintiff address is not a lawyer");
        require(lawyers[defendantLawyerAddress], "PoliceFunctions: Defendant address is not a lawyer");
        
        litigationApplications[caseId].plaintiffLawyer = plaintiffLawyerAddress;
        litigationApplications[caseId].defendantLawyer = defendantLawyerAddress;
        
        emit LawyerAssigned(caseId, plaintiffLawyerAddress, msg.sender);
        emit LawyerAssigned(caseId, defendantLawyerAddress, msg.sender);
    }

    // 设置证据可见性（公安/检察官共用）
    function setEvidenceVisibility(uint256 evidenceId, EvidenceVisibility visibility) public onlyPolice {
        require(evidences[evidenceId].exists, "PoliceFunctions: Evidence does not exist");
        evidenceVisibilities[evidenceId] = visibility;
    }
}

/**
 * @title ProsecutorFunctions
 * @dev 检察官专属功能合约：审查起诉、质证、公诉相关操作
 */
contract ProsecutorFunctions is EvidenceStorage {
    // 添加补正证据
    function addCorrection(uint256 originalEvidenceId, string memory caseId, string memory newHash, string memory reason) public onlyProsecutor returns (uint256) {
        require(evidences[originalEvidenceId].exists, "ProsecutorFunctions: Original evidence does not exist");
        require(bytes(newHash).length > 0, "ProsecutorFunctions: Hash cannot be empty");
        
        evidenceCounter++;
        uint256 correctionEvidenceId = evidenceCounter;
        Evidence memory correctionEvidence = Evidence({
            evidenceId: correctionEvidenceId,
            hash: newHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        evidences[correctionEvidenceId] = correctionEvidence;
        caseToEvidences[caseId].push(correctionEvidenceId);
        evidenceHistory[correctionEvidenceId].push(correctionEvidence);
        
        evidenceCorrections[originalEvidenceId].push(Correction({
            originalEvidenceId: originalEvidenceId,
            correctionEvidenceId: correctionEvidenceId,
            corrector: msg.sender,
            timestamp: block.timestamp,
            reason: reason
        }));
        
        emit CorrectionAdded(originalEvidenceId, correctionEvidenceId, msg.sender, block.timestamp);
        return correctionEvidenceId;
    }

    // 退回补充侦查
    function returnForSupplementaryInvestigation(string memory caseId, string memory opinionLetterHash, string memory reason) public onlyProsecutor {
        require(cases[caseId].exists, "ProsecutorFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "ProsecutorFunctions: Case has been withdrawn");
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(bytes(opinionLetterHash).length > 0, "ProsecutorFunctions: Opinion letter hash cannot be empty");
        require(bytes(reason).length > 0, "ProsecutorFunctions: Reason cannot be empty");
        
        supplementaryInvestigations[caseId].push(SupplementaryInvestigation({
            caseId: caseId,
            prosecutor: msg.sender,
            returnTime: block.timestamp,
            opinionLetterHash: opinionLetterHash,
            reason: reason,
            exists: true
        }));
        
        emit SupplementaryInvestigationReturned(caseId, msg.sender, opinionLetterHash, block.timestamp);
    }

    // 生成审查结论
    function generateReviewConclusion(string memory caseId, ReviewConclusion conclusion, string memory conclusionDocumentHash) public onlyProsecutor {
        require(cases[caseId].exists, "ProsecutorFunctions: Case does not exist");
        require(!cases[caseId].withdrawn, "ProsecutorFunctions: Case has been withdrawn");
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(bytes(conclusionDocumentHash).length > 0, "ProsecutorFunctions: Conclusion document hash cannot be empty");
        require(!reviewResults[caseId].exists, "ProsecutorFunctions: Review conclusion already exists");
        
        reviewResults[caseId] = ReviewResult({
            caseId: caseId,
            prosecutor: msg.sender,
            conclusion: conclusion,
            reviewTime: block.timestamp,
            conclusionDocumentHash: conclusionDocumentHash,
            exists: true
        });
        
        emit ReviewConclusionGenerated(caseId, msg.sender, conclusion, block.timestamp);
    }

    // 确认公诉团队（公诉案件）
    function confirmProsecutionTeam(string memory caseId, address[] memory teamMembers) public onlyProsecutor {
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "ProsecutorFunctions: Only for public prosecution cases");
        require(teamMembers.length > 0, "ProsecutorFunctions: Team members cannot be empty");
        
        for (uint256 i = 0; i < teamMembers.length; i++) {
            require(prosecutors[teamMembers[i]], "ProsecutorFunctions: Team member is not a prosecutor");
        }
        
        prosecutionTeams[caseId] = ProsecutionTeam({
            leadProsecutor: msg.sender,
            teamMembers: teamMembers,
            confirmed: true
        });
        
        emit ProsecutionTeamConfirmed(caseId, msg.sender, teamMembers, msg.sender);
    }

    // 确认原被告律师信息（其他诉讼）
    function confirmLawyerInfo(string memory caseId, address plaintiffLawyerAddress, address defendantLawyerAddress) public onlyProsecutor {
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.Other, "ProsecutorFunctions: Only for other litigation cases");
        require(lawyers[plaintiffLawyerAddress], "ProsecutorFunctions: Plaintiff address is not a lawyer");
        require(lawyers[defendantLawyerAddress], "ProsecutorFunctions: Defendant address is not a lawyer");
        
        litigationApplications[caseId].plaintiffLawyer = plaintiffLawyerAddress;
        litigationApplications[caseId].defendantLawyer = defendantLawyerAddress;
        
        emit LawyerInfoConfirmed(caseId, plaintiffLawyerAddress, defendantLawyerAddress, msg.sender);
    }

    // 提交证据质证意见
    function submitEvidenceCrossExamination(uint256 evidenceId, string memory caseId, string memory opinionHash) public onlyProsecutor {
        require(evidences[evidenceId].exists, "ProsecutorFunctions: Evidence does not exist");
        require(cases[caseId].exists, "ProsecutorFunctions: Case does not exist");
        require(bytes(opinionHash).length > 0, "ProsecutorFunctions: Opinion hash cannot be empty");
        
        evidenceCrossExaminations[evidenceId].push(EvidenceCrossExamination({
            evidenceId: evidenceId,
            caseId: caseId,
            prosecutor: msg.sender,
            submitTime: block.timestamp,
            opinionHash: opinionHash,
            exists: true
        }));
        
        emit EvidenceCrossExaminationSubmitted(evidenceId, caseId, msg.sender, opinionHash, block.timestamp);
    }

    // 提交公诉意见（公诉案件）
    function submitProsecutionOpinion(string memory caseId, string memory opinionHash) public onlyProsecutor {
        require(cases[caseId].exists, "ProsecutorFunctions: Case does not exist");
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "ProsecutorFunctions: Only for public prosecution cases");
        require(bytes(opinionHash).length > 0, "ProsecutorFunctions: Opinion hash cannot be empty");
        require(!prosecutionOpinions[caseId].exists, "ProsecutorFunctions: Prosecution opinion already exists");
        
        prosecutionOpinions[caseId] = ProsecutionOpinion({
            caseId: caseId,
            prosecutor: msg.sender,
            submitTime: block.timestamp,
            opinionHash: opinionHash,
            exists: true
        });
        
        emit ProsecutionOpinionSubmitted(caseId, msg.sender, opinionHash, block.timestamp);
    }

    // 设置证据可见性（公安/检察官共用）
    function setEvidenceVisibility(uint256 evidenceId, EvidenceVisibility visibility) public onlyProsecutor {
        require(evidences[evidenceId].exists, "ProsecutorFunctions: Evidence does not exist");
        evidenceVisibilities[evidenceId] = visibility;
    }

    // 审批涉密证据申请（检察官/法官共用）
    function approveConfidentialEvidenceApplication(uint256 evidenceId, uint256 applicationIndex, bool approved) public onlyProsecutor {
        require(confidentialEvidenceApplications[evidenceId].length > applicationIndex, "ProsecutorFunctions: Application does not exist");
        ConfidentialEvidenceApplication storage application = confidentialEvidenceApplications[evidenceId][applicationIndex];
        require(!application.approved, "ProsecutorFunctions: Application already processed");
        
        application.approved = approved;
        application.approver = msg.sender;
        application.approvalTime = block.timestamp;
        
        emit ConfidentialEvidenceApplicationApproved(evidenceId, application.caseId, msg.sender, block.timestamp);
    }

    // ============ 检察官专属查询函数 ============
    function getSupplementaryInvestigations(string memory caseId) public view onlyProsecutor returns (address[] memory prosecutorAddresses, uint256[] memory returnTimes, string[] memory opinionLetterHashes, string[] memory reasons) {
        require(cases[caseId].exists, "ProsecutorFunctions: Case does not exist");
        SupplementaryInvestigation[] memory supplements = supplementaryInvestigations[caseId];
        uint256 length = supplements.length;
        
        prosecutorAddresses = new address[](length);
        returnTimes = new uint256[](length);
        opinionLetterHashes = new string[](length);
        reasons = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            prosecutorAddresses[i] = supplements[i].prosecutor;
            returnTimes[i] = supplements[i].returnTime;
            opinionLetterHashes[i] = supplements[i].opinionLetterHash;
            reasons[i] = supplements[i].reason;
        }
        
        return (prosecutorAddresses, returnTimes, opinionLetterHashes, reasons);
    }

    function getReviewResult(string memory caseId) public view onlyProsecutor returns (address prosecutor, ReviewConclusion conclusion, uint256 reviewTime, string memory conclusionDocumentHash) {
        require(cases[caseId].exists, "ProsecutorFunctions: Case does not exist");
        require(reviewResults[caseId].exists, "ProsecutorFunctions: Review result does not exist");
        
        ReviewResult memory result = reviewResults[caseId];
        return (result.prosecutor, result.conclusion, result.reviewTime, result.conclusionDocumentHash);
    }

    function getProsecutionTeam(string memory caseId) public view onlyProsecutor returns (address leadProsecutor, address[] memory teamMembers, bool confirmed) {
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "ProsecutorFunctions: Only for public prosecution cases");
        
        ProsecutionTeam memory team = prosecutionTeams[caseId];
        return (team.leadProsecutor, team.teamMembers, team.confirmed);
    }

    function getEvidenceCrossExaminations(uint256 evidenceId) public view onlyProsecutor returns (address[] memory prosecutorAddresses, uint256[] memory submitTimes, string[] memory opinionHashes) {
        require(evidences[evidenceId].exists, "ProsecutorFunctions: Evidence does not exist");
        EvidenceCrossExamination[] memory examinations = evidenceCrossExaminations[evidenceId];
        uint256 length = examinations.length;
        
        prosecutorAddresses = new address[](length);
        submitTimes = new uint256[](length);
        opinionHashes = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            prosecutorAddresses[i] = examinations[i].prosecutor;
            submitTimes[i] = examinations[i].submitTime;
            opinionHashes[i] = examinations[i].opinionHash;
        }
        
        return (prosecutorAddresses, submitTimes, opinionHashes);
    }

    function getProsecutionOpinion(string memory caseId) public view onlyProsecutor returns (address prosecutor, uint256 submitTime, string memory opinionHash) {
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "ProsecutorFunctions: Only for public prosecution cases");
        require(prosecutionOpinions[caseId].exists, "ProsecutorFunctions: Prosecution opinion does not exist");
        
        ProsecutionOpinion memory opinion = prosecutionOpinions[caseId];
        return (opinion.prosecutor, opinion.submitTime, opinion.opinionHash);
    }

    function viewFullCaseFileForPublicProsecution(string memory caseId) public view onlyProsecutor returns (string memory caseFileHash, uint256[] memory evidenceList, address assignedLawyer) {
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "ProsecutorFunctions: Only for public prosecution cases");
        
        LitigationApplication memory application = litigationApplications[caseId];
        return (application.caseFileHash, application.evidenceList, application.assignedLawyer);
    }

    function viewRelatedEvidenceForOtherLitigation(string memory caseId, uint256[] memory relatedEvidenceIds) public view onlyProsecutor returns (uint256[] memory evidenceIds, string[] memory hashes, address[] memory uploaders, uint256[] memory timestamps) {
        require(litigationApplications[caseId].exists, "ProsecutorFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.Other, "ProsecutorFunctions: Only for other litigation cases");
        require(relatedEvidenceIds.length > 0, "ProsecutorFunctions: Evidence list cannot be empty");
        
        uint256[] memory caseEvidenceIds = caseToEvidences[caseId];
        for (uint256 i = 0; i < relatedEvidenceIds.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < caseEvidenceIds.length; j++) {
                if (caseEvidenceIds[j] == relatedEvidenceIds[i]) {
                    found = true;
                    break;
                }
            }
            require(found, "ProsecutorFunctions: Evidence does not belong to this case");
        }
        
        uint256 length = relatedEvidenceIds.length;
        evidenceIds = new uint256[](length);
        hashes = new string[](length);
        uploaders = new address[](length);
        timestamps = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            require(evidences[relatedEvidenceIds[i]].exists, "ProsecutorFunctions: Evidence does not exist");
            Evidence memory evidence = evidences[relatedEvidenceIds[i]];
            evidenceIds[i] = evidence.evidenceId;
            hashes[i] = evidence.hash;
            uploaders[i] = evidence.uploader;
            timestamps[i] = evidence.timestamp;
        }
        
        return (evidenceIds, hashes, uploaders, timestamps);
    }
}

/**
 * @title LawyerFunctions
 * @dev 律师专属功能合约：案件查阅、辩护、质证相关操作
 */
contract LawyerFunctions is EvidenceStorage {
    // 查看案件基本信息和公开证据清单
    function viewCaseBasicInfoAndPublicEvidence(string memory caseId) public view onlyLawyer returns (string memory basicInfo, uint256[] memory publicEvidenceIds) {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        
        uint256[] memory allEvidenceIds = caseToEvidences[caseId];
        uint256 publicCount = 0;
        for (uint256 i = 0; i < allEvidenceIds.length; i++) {
            if (evidenceVisibilities[allEvidenceIds[i]] == EvidenceVisibility.Public) {
                publicCount++;
            }
        }
        
        publicEvidenceIds = new uint256[](publicCount);
        uint256 index = 0;
        for (uint256 i = 0; i < allEvidenceIds.length; i++) {
            if (evidenceVisibilities[allEvidenceIds[i]] == EvidenceVisibility.Public) {
                publicEvidenceIds[index] = allEvidenceIds[i];
                index++;
            }
        }
        
        return (cases[caseId].basicInfo, publicEvidenceIds);
    }

    // 调阅/下载卷宗
    function accessCaseFile(string memory caseId, string memory watermarkedFileHash) public onlyLawyer {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(litigationApplications[caseId].exists, "LawyerFunctions: Litigation application does not exist");
        require(bytes(watermarkedFileHash).length > 0, "LawyerFunctions: Watermarked file hash cannot be empty");
        
        accessRecords[caseId].push(AccessRecord({
            caseId: caseId,
            lawyer: msg.sender,
            accessTime: block.timestamp,
            watermarkedFileHash: watermarkedFileHash,
            exists: true
        }));
        
        emit CaseFileAccessed(caseId, msg.sender, watermarkedFileHash, block.timestamp);
    }

    // 提交涉密证据申请
    function applyForConfidentialEvidence(string memory caseId, uint256 evidenceId, string memory reason) public onlyLawyer {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(evidences[evidenceId].exists, "LawyerFunctions: Evidence does not exist");
        require(bytes(reason).length > 0, "LawyerFunctions: Reason cannot be empty");
        require(evidenceVisibilities[evidenceId] == EvidenceVisibility.Confidential, "LawyerFunctions: Evidence is not confidential");
        
        confidentialEvidenceApplications[evidenceId].push(ConfidentialEvidenceApplication({
            caseId: caseId,
            evidenceId: evidenceId,
            lawyer: msg.sender,
            applicationTime: block.timestamp,
            reason: reason,
            approved: false,
            approver: address(0),
            approvalTime: 0,
            exists: true
        }));
        
        emit ConfidentialEvidenceApplicationSubmitted(evidenceId, caseId, msg.sender, block.timestamp);
    }

    // 庭前提交辩护/代理意见
    function submitPreTrialOpinion(string memory caseId, string memory opinionHash) public onlyLawyer {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(bytes(opinionHash).length > 0, "LawyerFunctions: Opinion hash cannot be empty");
        
        preTrialOpinions[caseId].push(PreTrialOpinion({
            caseId: caseId,
            lawyer: msg.sender,
            submitTime: block.timestamp,
            opinionHash: opinionHash,
            exists: true
        }));
        
        emit PreTrialOpinionSubmitted(caseId, msg.sender, opinionHash, block.timestamp);
    }

    // 庭审提交质证意见
    function submitCrossExamination(uint256 evidenceId, string memory caseId, string memory opinionHash) public onlyLawyer {
        require(evidences[evidenceId].exists, "LawyerFunctions: Evidence does not exist");
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(bytes(opinionHash).length > 0, "LawyerFunctions: Opinion hash cannot be empty");
        
        lawyerCrossExaminations[evidenceId].push(LawyerCrossExamination({
            evidenceId: evidenceId,
            caseId: caseId,
            lawyer: msg.sender,
            submitTime: block.timestamp,
            opinionHash: opinionHash,
            exists: true
        }));
        
        emit LawyerCrossExaminationSubmitted(evidenceId, caseId, msg.sender, opinionHash, block.timestamp);
    }

    // 庭审发表辩护/代理观点
    function submitTrialTranscript(string memory caseId, string memory transcriptHash) public onlyLawyer {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(bytes(transcriptHash).length > 0, "LawyerFunctions: Transcript hash cannot be empty");
        
        trialTranscripts[caseId].push(TrialTranscript({
            caseId: caseId,
            lawyer: msg.sender,
            submitTime: block.timestamp,
            transcriptHash: transcriptHash,
            exists: true
        }));
        
        emit TrialTranscriptSubmitted(caseId, msg.sender, transcriptHash, block.timestamp);
    }

    // 与承办检察官沟通（公诉案件）
    function communicateWithProsecutor(string memory caseId, address prosecutorAddress, string memory communicationHash) public onlyLawyer {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(litigationApplications[caseId].exists, "LawyerFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "LawyerFunctions: Only for public prosecution cases");
        require(prosecutors[prosecutorAddress], "LawyerFunctions: Address is not a prosecutor");
        require(bytes(communicationHash).length > 0, "LawyerFunctions: Communication hash cannot be empty");
        
        prosecutorCommunications[caseId].push(ProsecutorCommunication({
            caseId: caseId,
            lawyer: msg.sender,
            prosecutor: prosecutorAddress,
            communicationTime: block.timestamp,
            communicationHash: communicationHash,
            exists: true
        }));
        
        emit ProsecutorCommunicationRecorded(caseId, msg.sender, prosecutorAddress, communicationHash, block.timestamp);
    }

    // 提交证据异议申请（公诉案件）
    function submitEvidenceObjection(string memory caseId, uint256 evidenceId, address prosecutorAddress, string memory objectionHash) public onlyLawyer {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(evidences[evidenceId].exists, "LawyerFunctions: Evidence does not exist");
        require(litigationApplications[caseId].exists, "LawyerFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.PublicProsecution, "LawyerFunctions: Only for public prosecution cases");
        require(prosecutors[prosecutorAddress], "LawyerFunctions: Address is not a prosecutor");
        require(bytes(objectionHash).length > 0, "LawyerFunctions: Objection hash cannot be empty");
        
        evidenceObjections[evidenceId].push(EvidenceObjection({
            caseId: caseId,
            evidenceId: evidenceId,
            lawyer: msg.sender,
            prosecutor: prosecutorAddress,
            submitTime: block.timestamp,
            objectionHash: objectionHash,
            exists: true
        }));
        
        emit EvidenceObjectionSubmitted(evidenceId, caseId, msg.sender, prosecutorAddress, objectionHash, block.timestamp);
    }

    // 提交起诉证据（原告律师，其他诉讼）
    function submitProsecutionEvidence(string memory caseId, string memory hash) public onlyLawyer returns (uint256) {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(litigationApplications[caseId].exists, "LawyerFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.Other, "LawyerFunctions: Only for other litigation cases");
        require(litigationApplications[caseId].plaintiffLawyer == msg.sender, "LawyerFunctions: Only plaintiff lawyer can submit prosecution evidence");
        require(bytes(hash).length > 0, "LawyerFunctions: Hash cannot be empty");
        
        evidenceCounter++;
        uint256 newEvidenceId = evidenceCounter;
        Evidence memory newEvidence = Evidence({
            evidenceId: newEvidenceId,
            hash: hash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        evidences[newEvidenceId] = newEvidence;
        evidenceVisibilities[newEvidenceId] = EvidenceVisibility.Public;
        caseToEvidences[caseId].push(newEvidenceId);
        evidenceHistory[newEvidenceId].push(newEvidence);
        
        emit ProsecutionEvidenceSubmitted(caseId, msg.sender, newEvidenceId, block.timestamp);
        return newEvidenceId;
    }

    // 提交抗辩证据（被告律师，其他诉讼）
    function submitDefenseEvidence(string memory caseId, string memory hash) public onlyLawyer returns (uint256) {
        require(cases[caseId].exists, "LawyerFunctions: Case does not exist");
        require(litigationApplications[caseId].exists, "LawyerFunctions: Litigation application does not exist");
        require(litigationApplications[caseId].litigationType == LitigationType.Other, "LawyerFunctions: Only for other litigation cases");
        require(litigationApplications[caseId].defendantLawyer == msg.sender, "LawyerFunctions: Only defendant lawyer can submit defense evidence");
        require(bytes(hash).length > 0, "LawyerFunctions: Hash cannot be empty");
        
        evidenceCounter++;
        uint256 newEvidenceId = evidenceCounter;
        Evidence memory newEvidence = Evidence({
            evidenceId: newEvidenceId,
            hash: hash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        evidences[newEvidenceId] = newEvidence;
        evidenceVisibilities[newEvidenceId] = EvidenceVisibility.Public;
        caseToEvidences[caseId].push(newEvidenceId);
        evidenceHistory[newEvidenceId].push(newEvidence);
        
        emit DefenseEvidenceSubmitted(caseId, msg.sender, newEvidenceId, block.timestamp);
        return newEvidenceId;
    }
}

/**
 * @title JudgeFunctions
 * @dev 法官专属功能合约：案件受理、庭审组织、判决相关操作
 */
contract JudgeFunctions is EvidenceStorage {
    // 审核起诉材料，决定是否受理
    function reviewCaseAcceptance(string memory caseId, bool accepted) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(litigationApplications[caseId].exists, "JudgeFunctions: Litigation application does not exist");
        
        CaseAcceptanceStatus status = accepted ? CaseAcceptanceStatus.Accepted : CaseAcceptanceStatus.Rejected;
        caseAcceptanceStatuses[caseId] = status;
        
        emit CaseAcceptanceReviewed(caseId, msg.sender, status, block.timestamp);
    }

    // 分配庭审排期
    function allocateTrialSchedule(string memory caseId, uint256 trialTime, string memory courtroom, address[] memory panelMembers) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(caseAcceptanceStatuses[caseId] == CaseAcceptanceStatus.Accepted, "JudgeFunctions: Case must be accepted first");
        require(trialTime > block.timestamp, "JudgeFunctions: Trial time must be in the future");
        require(bytes(courtroom).length > 0, "JudgeFunctions: Courtroom cannot be empty");
        require(panelMembers.length > 0, "JudgeFunctions: Panel members cannot be empty");
        
        for (uint256 i = 0; i < panelMembers.length; i++) {
            require(judges[panelMembers[i]], "JudgeFunctions: Panel member is not a judge");
        }
        
        trialSchedules[caseId] = TrialSchedule({
            caseId: caseId,
            trialTime: trialTime,
            courtroom: courtroom,
            panelMembers: panelMembers,
            exists: true
        });
        
        emit TrialScheduleAllocated(caseId, msg.sender, trialTime, courtroom, block.timestamp);
    }

    // 审批证据公开范围
    function approveEvidenceDisclosureScope(string memory caseId, uint256[] memory evidenceIds) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        
        uint256[] memory caseEvidenceIds = caseToEvidences[caseId];
        for (uint256 i = 0; i < evidenceIds.length; i++) {
            bool found = false;
            for (uint256 j = 0; j < caseEvidenceIds.length; j++) {
                if (caseEvidenceIds[j] == evidenceIds[i]) {
                    found = true;
                    break;
                }
            }
            require(found, "JudgeFunctions: Evidence does not belong to this case");
            evidenceVisibilities[evidenceIds[i]] = EvidenceVisibility.Public;
        }
        
        emit EvidenceDisclosureScopeApproved(caseId, evidenceIds, msg.sender, block.timestamp);
    }

    // 分配案件查看权限
    function allocateCaseViewPermission(string memory caseId, address userAddress, CaseViewStage[] memory allowedStages) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(prosecutors[userAddress] || lawyers[userAddress], "JudgeFunctions: User must be a prosecutor or lawyer");
        require(allowedStages.length > 0, "JudgeFunctions: Allowed stages cannot be empty");
        
        caseViewPermissions[caseId][userAddress] = CaseViewPermission({
            caseId: caseId,
            user: userAddress,
            allowedStages: allowedStages,
            exists: true
        });
        
        emit CaseViewPermissionAllocated(caseId, userAddress, allowedStages, msg.sender, block.timestamp);
    }

    // 生成庭审笔录
    function generateTrialTranscript(string memory caseId, string memory transcriptHash) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(trialSchedules[caseId].exists, "JudgeFunctions: Trial schedule must be allocated first");
        require(bytes(transcriptHash).length > 0, "JudgeFunctions: Transcript hash cannot be empty");
        
        emit TrialTranscriptGenerated(caseId, msg.sender, transcriptHash, block.timestamp);
    }

    // 判定证据采信有效性
    function decideEvidenceAdmissibility(uint256 evidenceId, string memory caseId, EvidenceAdmissibility decision, string memory reason) public onlyJudge {
        require(evidences[evidenceId].exists, "JudgeFunctions: Evidence does not exist");
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(bytes(reason).length > 0, "JudgeFunctions: Reason cannot be empty");
        
        evidenceAdmissibilityDecisions[evidenceId] = EvidenceAdmissibilityDecision({
            evidenceId: evidenceId,
            caseId: caseId,
            judge: msg.sender,
            decision: decision,
            decisionTime: block.timestamp,
            reason: reason,
            exists: true
        });
        
        emit EvidenceAdmissibilityDecided(evidenceId, caseId, msg.sender, decision, block.timestamp);
    }

    // 生成判决书
    function generateJudgment(string memory caseId, string memory judgmentResult, string[] memory legalProvisions, string memory judgmentDocumentHash) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(bytes(judgmentResult).length > 0, "JudgeFunctions: Judgment result cannot be empty");
        require(bytes(judgmentDocumentHash).length > 0, "JudgeFunctions: Judgment document hash cannot be empty");
        require(!judgments[caseId].exists, "JudgeFunctions: Judgment already exists");
        
        judgments[caseId] = Judgment({
            caseId: caseId,
            judge: msg.sender,
            judgmentTime: block.timestamp,
            judgmentResult: judgmentResult,
            legalProvisions: legalProvisions,
            judgmentDocumentHash: judgmentDocumentHash,
            exists: true
        });
        
        emit JudgmentGenerated(caseId, msg.sender, judgmentDocumentHash, block.timestamp);
    }

    // 推送判决书+送达回执
    function deliverJudgment(string memory caseId, address recipientAddress, string memory receiptHash) public onlyJudge {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(judgments[caseId].exists, "JudgeFunctions: Judgment must be generated first");
        require(bytes(receiptHash).length > 0, "JudgeFunctions: Receipt hash cannot be empty");
        
        deliveryReceipts[caseId].push(DeliveryReceipt({
            caseId: caseId,
            recipient: recipientAddress,
            deliveryTime: block.timestamp,
            receiptHash: receiptHash,
            exists: true
        }));
        
        emit JudgmentDelivered(caseId, recipientAddress, receiptHash, block.timestamp);
    }

    // 审批涉密证据申请（检察官/法官共用）
    function approveConfidentialEvidenceApplication(uint256 evidenceId, uint256 applicationIndex, bool approved) public onlyJudge {
        require(confidentialEvidenceApplications[evidenceId].length > applicationIndex, "JudgeFunctions: Application does not exist");
        ConfidentialEvidenceApplication storage application = confidentialEvidenceApplications[evidenceId][applicationIndex];
        require(!application.approved, "JudgeFunctions: Application already processed");
        
        application.approved = approved;
        application.approver = msg.sender;
        application.approvalTime = block.timestamp;
        
        emit ConfidentialEvidenceApplicationApproved(evidenceId, application.caseId, msg.sender, block.timestamp);
    }

    // ============ 法官专属查询函数 ============
    function getCaseAcceptanceStatus(string memory caseId) public view onlyJudge returns (CaseAcceptanceStatus) {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        return caseAcceptanceStatuses[caseId];
    }

    function getTrialSchedule(string memory caseId) public view onlyJudge returns (uint256 trialTime, string memory courtroom, address[] memory panelMembers, bool exists) {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        TrialSchedule memory schedule = trialSchedules[caseId];
        return (schedule.trialTime, schedule.courtroom, schedule.panelMembers, schedule.exists);
    }

    function getCaseViewPermission(string memory caseId, address userAddress) public view onlyJudge returns (CaseViewStage[] memory allowedStages, bool exists) {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        CaseViewPermission memory permission = caseViewPermissions[caseId][userAddress];
        return (permission.allowedStages, permission.exists);
    }

    function getEvidenceAdmissibilityDecision(uint256 evidenceId) public view onlyJudge returns (address judge, EvidenceAdmissibility decision, uint256 decisionTime, string memory reason, bool exists) {
        require(evidences[evidenceId].exists, "JudgeFunctions: Evidence does not exist");
        EvidenceAdmissibilityDecision memory admissibilityDecision = evidenceAdmissibilityDecisions[evidenceId];
        return (
            admissibilityDecision.judge,
            admissibilityDecision.decision,
            admissibilityDecision.decisionTime,
            admissibilityDecision.reason,
            admissibilityDecision.exists
        );
    }

    function getJudgment(string memory caseId) public view onlyJudge returns (address judge, uint256 judgmentTime, string memory judgmentResult, string[] memory legalProvisions, string memory judgmentDocumentHash) {
        require(cases[caseId].exists, "JudgeFunctions: Case does not exist");
        require(judgments[caseId].exists, "JudgeFunctions: Judgment does not exist");
        
        Judgment memory judgment = judgments[caseId];
        return (
            judgment.judge,
            judgment.judgmentTime,
            judgment.judgmentResult,
            judgment.legalProvisions,
            judgment.judgmentDocumentHash
        );
    }
}