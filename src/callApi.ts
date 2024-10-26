export async function callApi(method: string, filter: {}, select: string[] | null, entityTypeId: number | null) : Promise<any[]> {

    let total = 0;
    const maxTotal = 50;
    let data = [];
    const params: {filter: any; select: string[] | null, entityTypeId: number | null, id: number | null, start: number} = {
      filter: filter ? filter : null,
      select: select ? select : null,
      entityTypeId: entityTypeId ? entityTypeId : null,
      id: method === "crm.dealcategory.stage.list" ? entityTypeId : null,
      start: 0,
    };

    const exceptions: string[] = ["crm.status.list"];
    console.log(method);
    console.log(params);
    await new Promise((resolve, reject) => {
      // @ts-ignore
      BX24.callMethod(method, params, (res :any) => {
        if (res.data()) {
          total = res.total();
          data = res.data();
          resolve(data);
        }
      });
    });

    if (total > maxTotal && !exceptions.includes(method)) {
      let cmd = {};
      const iterations = Math.ceil(total / maxTotal);
      let resultData: any[] = [];
      for (let i = 0; i < iterations; i++) {
        params.start = i * maxTotal;
          const key = `cmd${i}`;
          const value = {
          method: method,
          params: {
            select: select,
            filter: filter,
            start: i * maxTotal,
          }
          }
          cmd[key] = value;
        if ((i + 1) % maxTotal === 0 || i + 1 === iterations) {
          i > maxTotal ? await new Promise(resolve => setTimeout(resolve, 2000)) : null;
          const batchLength : number = (i + 1) % maxTotal === 0 ? maxTotal : iterations % maxTotal;
        await new Promise((resolve: any, reject) => {
        // @ts-ignore
        BX24.callBatch(cmd, (res: any) => {
          for (let r : number = i - batchLength + 1; r < i + 1; r++) {
            let key = `cmd${r}`;
            resultData.push(cmd[key].data());
          }
          resultData = resultData.flat();
          data = resultData;
          resolve();
        });
      })
      cmd = {};
        }
      }
    }
    return data;
  }