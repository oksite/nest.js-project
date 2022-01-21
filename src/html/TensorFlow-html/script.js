const shuangseqiu = new Vue({
    el: '#app',
    data: {
        items: [],
        redBalls: [0, 0, 0, 0, 0, 0],
        blueBalls: [0],
        useTime: 0
    },
    methods: {
        forecast() {
            const start = new Date().getTime();
            // 定义线性衰退模型
            let model = tf.sequential();
            // add方法添加一个图层实例
            // tf.layers.dense 创建一个输入输出维度为7的层
            model.add(tf.layers.dense({units: 7, inputShape: [7]}));
            // 指定损失函数和优化器
            model.compile({loss: "meanSquaredError", optimizer: "sgd"});
            // 格式化数据
            let r = this.formatData();
            // 输入,输出数据
            let [x,y]=[tf.tensor(r.input),tf.tensor(r.output)];
            // 指定损失函数和优化器
            model.compile({loss: "meanSquaredError", optimizer: "sgd"});
            // 训练模型
            model.fit(x, y);
            //张量
            let u = tf.tensor(r.use);
            console.log('xx', u)
            //开始预测
            model.predict(u).data().then(res => {
                res.map((ball, index) => {
                    if (index < 6) {
                        // 红球
                        let balls = Math.abs(parseInt(ball));
                        if (balls === 0) {
                            balls = 1;
                        }
                        ;
                        if (balls > 35) {
                            balls = 35;
                        }
                        ;
                        this.redBalls[index] = balls;
                    } else {
                        // 蓝球
                        let balls = Math.abs(parseInt(ball));
                        if (balls === 0) {
                            balls = 1;
                        }
                        ;
                        if (balls > 16) {
                            balls = 16;
                        }
                        ;
                        this.blueBalls[0] = balls;
                    }
                    ;
                });
                //定义一个set
                const tmp = new Set(this.redBalls);
                //判断是否有重复项,有就重新预测
                if ([...tmp].length < 6) {
                    this.forecast();
                    return false;
                }
                ;
                //红球排序
                this.redBalls.sort((a, b) => {
                    return a - b;
                });
                const end = new Date().getTime();
                this.useTime = end - start;
            });
        },
        formatData() {
            //格式化数据
            let x = [];
            let y = [];
            let used = [];
            this.items.map((res, index) => {
                if (index !== 0) {
                    let b = [...res.value[0], ...res.value[1]];
                    y.push(b);
                } else {
                    let b = [...res.value[0], ...res.value[1]];
                    used.push(b);
                }
                ;
                if (index !== this.items.length - 1) {
                    let b = [...res.value[0], ...res.value[1]];
                    x.push(b);
                } else {
                    let b = [...res.value[0], ...res.value[1]];
                    used.push(b);
                }
                ;
            });
            return {
                use: used,
                input: x,
                output: y
            };
        }
    },
    created() {
        //156  刚好一年
        const that = this;
        axios
            .get('https://kaicai.net/api/trial/drawResult?code=ssq&format=json&rows=156')//http转https
            .then(res => {
                let tmp = [];
                for (let i = 0, len = res.data.data.length; i < len; i++) {
                    let [red, blue] = [[], []];
                    let redTmp = res.data.data[i].drawResult.match(/(\S*)\+/)[1].split(',');
                    for (let j = 0, jlen = redTmp.length; j < jlen; j++) {
                        red.push(parseInt(redTmp[j]));
                    }
                    ;
                    blue.push(parseInt(res.data.data[i].drawResult.match(/\+(\S*)/)[1]));
                    tmp.push({
                        data: res.data.data[i].issue,
                        value: [red, blue]
                    });
                };
                that.items = tmp;
                that.forecast();
            })
            .catch(err => {
                console.log(`错误信息${err}`);
            });

    }
});