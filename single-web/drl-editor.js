/**
 * DRL 规则编辑器 Vue 应用
 */
const { createApp } = Vue;

const drlEditorApp = createApp({
  data() {
    return {
      config: {
        package: 'com.example.rules',
        imports: '',
        globals: '',
        declarations: ''
      },
      rules: [],
      activeRules: 0, // 控制折叠面板展开状态（accordion 模式下为单个值）
      copyButtonText: '复制代码',
    };
  },
  mounted() {
    // 初始化：添加第一个规则
    this.addRule();
    // 或者加载示例
    // this.loadSample();
  },
  methods: {
    /**
     * 添加新规则
     */
    addRule() {
      this.rules.push({
        name: 'rule_' + Date.now(),
        enabled: true,
        salience: 10,
        noLoop: false,
        lockOnActive: false,
        when: '',
        then: ''
      });
      // 自动展开新添加的规则
      this.activeRules = this.rules.length - 1;
    },

    /**
     * 确认删除规则
     * @param {number} index - 规则索引
     */
    confirmRemoveRule(index) {
      const ruleName = this.rules[index].name || `规则 ${index + 1}`;
      ElementPlus.ElMessageBox.confirm(
        `确定要删除规则"${ruleName}"吗？此操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }
      ).then(() => {
        this.removeRule(index);
        ElementPlus.ElMessage({
          type: 'success',
          message: '规则已删除'
        });
      }).catch(() => {
        // 用户取消删除
      });
    },

    /**
     * 删除规则
     * @param {number} index - 规则索引
     */
    removeRule(index) {
      this.rules.splice(index, 1);
      // 删除规则后调整 activeRules
      if (this.activeRules >= this.rules.length && this.rules.length > 0) {
        this.activeRules = this.rules.length - 1;
      } else if (this.rules.length === 0) {
        this.activeRules = null;
      }
    },

    /**
     * 加载示例规则
     */
    loadSample() {
      // 设置全局配置
      this.config = {
        package: 'com.example.rules',
        imports: 'import com.example.droolsdemo.model.Person;\nimport com.example.droolsdemo.util.RuleUtils;',
        globals: 'global org.slf4j.Logger logger;',
        declarations: ''
      };

      // 设置规则示例
      this.rules = [
        {
          name: 'CheckAdult',
          enabled: true,
          salience: 10,
          noLoop: true,
          lockOnActive: false,
          when: '    $p: Person($age: age >= 18)',
          then: '    $p.setAdult(true);\n    logger.info("{} 已成年",$p.getName());\n    update($p);'
        },
        {
          name: 'CheckSex',
          enabled: true,
          salience: 15,
          noLoop: false,
          lockOnActive: false,
          when: '    $p : Person(sex == "girl")',
          then: '    logger.warn("{} 是一个女孩", $p.getName());\n    $p.setSex("boy");\n    update($p);'
        }
      ];
      // 展开第一个规则
      this.activeRules = 0;
    },

    /**
     * 生成 DRL 代码
     * @returns {string} 生成的 DRL 代码
     */
    generateDRL() {
      const pkg = this.config.package || 'com.example.rules';
      const imports = this.config.imports.split('\n').filter(line => line.trim());
      const globals = this.config.globals.split('\n').filter(line => line.trim());
      const declarations = this.config.declarations;

      let code = `package ${pkg};\n\n`;

      if (imports.length > 0) {
        imports.forEach(imp => {
          code += `${imp.trim()}\n`;
        });
        code += `\n`;
      }

      if (declarations) {
        code += `${declarations}\n\n`;
      }

      if (globals.length > 0) {
        globals.forEach(g => {
          code += `global ${g.trim()}\n`;
        });
        code += `\n`;
      }

      this.rules.forEach(rule => {
        code += `rule "${rule.name}"\n`;
        if (rule.enabled !== undefined) {
          code += `    enabled ${rule.enabled}\n`;
        }
        if (rule.salience !== undefined) {
          code += `    salience ${rule.salience}\n`;
        }
        if (rule.noLoop) {
          code += `    no-loop true\n`;
        }
        if (rule.lockOnActive) {
          code += `    lock-on-active true\n`;
        }
        code += `when\n`;
        if (rule.when) {
          code += `${rule.when}\n`;
        }
        code += `then\n`;
        if (rule.then) {
          const thenLines = rule.then.split('\n');
          thenLines.forEach(line => {
            code += `${line}\n`;
          });
        }
        code += `end\n\n`;
      });

      return code;
    },

    /**
     * 下载 DRL 文件
     */
    downloadDRL() {
      const code = this.generateDRL();
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rules-${Date.now()}.drl`;
      a.click();
      URL.revokeObjectURL(url);
    },

    /**
     * 复制代码到剪贴板
     */
    async copyCode() {
      const code = this.generateDRL();
      try {
        await navigator.clipboard.writeText(code);
        this.copyButtonText = '已复制！';
        setTimeout(() => {
          this.copyButtonText = '复制代码';
        }, 2000);
      } catch (err) {
        alert('复制失败: ' + err);
      }
    },

    /**
     * 返回首页
     */
    goHome() {
      window.location.href = '/';
    }
  }
});

// 挂载应用
drlEditorApp.use(ElementPlus, { size: 'default' });
drlEditorApp.mount('#app');

