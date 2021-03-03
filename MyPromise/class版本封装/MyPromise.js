class Promise{
    constructor(executor){
        this.PromiseState = "pending";
        this.PromiseResult = null;
        this.callbacks = [];
        const self = this;

        function resolve(data){
            if(self.PromiseState !== 'pending'){
                return;
            }
            self.PromiseState = 'fulfilled';
            self.PromiseResult = data;

            self.callbacks.forEach(item=>{
                item.onResolved(data);
            })
        }

        function reject(data) {
            if(self.PromiseState !== 'pending'){
                return;
            }

            self.PromiseState = 'rejected';
            self.PromiseResult = data;

            self.callbacks.forEach(item=>{
                item.onRejected(data);
            })
        }

        try {
            executor(resolve,reject);
        }catch (e) {
            reject(e);
        }
    }

    then(onResolved,onRejected) {
        const self = this;

        if(typeof onRejected != 'function'){
            onRejected = reason=>{
                throw reason;
            }
        }

        if(typeof onResolved != 'function'){
            onResolved = value=>{
                return value;
            }
        }

        return new Promise((resolve,reject)=>{

            function callback(type) {
                try {
                    let result = type(self.PromiseResult);
                    if(result instanceof Promise){
                        result.then((v)=>{
                            resolve(v);
                        },(r)=>{
                            reject(r);
                        });
                    }else{
                        resolve(result)
                    }
                }catch (e) {
                    reject(e);
                }
            }

            if(this.PromiseState==='fulfilled'){
                callback(onResolved);
            }
            if(this.PromiseState==='rejected'){
                callback(onRejected);
            }
            if(this.PromiseState==='pending'){
                this.callbacks.push({
                    onResolved:function(){
                        callback(onResolved);
                    },
                    onRejected:function(){
                        callback(onRejected);
                    }
                });
            }
        })
    }

    catch(onRejected){
        return this.then(undefined,onRejected);
    }

    static resolve(value){
        return new Promise((resolve,reject)=>{
            if(value instanceof Promise){
                value.then(v=>{
                    resolve(v);
                },r=>{
                    reject(r);
                })
            }else{
                resolve(value);
            }
        })
    }

    static reject(reason){
        return new Promise(resolve,reject=>{
            reject(reason);
        });
    }

    static all(promises){
        return new Promise(resolve,reject=>{

            let count = 0;
            let arr=[];

            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v=>{
                    count++;
                    arr[i] = v;
                    if(count==promises.length){
                        resolve(arr);
                    }
                },r=>{
                    reject(r);
                })
            }

            /*        promises.forEach(item=>{
                        item.then(v=>{
                            count++;
                            arr.push(v);
                            if(count==promises.length){
                                resolve(arr);
                            }
                        },r=>{
                            reject(r);
                        })
                    })*/
        });
    }

    static race(promises) {
        return new Promise((resolve,reject)=>{
            for (let i = 0; i <promises ; i++) {
                promises[i].then(v=>{
                    resolve(v);
                },r=>{
                    reject(r);
                })
            }
        });
    }

}






























