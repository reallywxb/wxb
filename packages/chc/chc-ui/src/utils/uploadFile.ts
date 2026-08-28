import { message } from 'ant-design-vue';
import JSZip from 'jszip';

/**
 * 根据链接获取远程的zip文件，并解析成jszip对象
 * @param url
 */
export function getRomoteZipFile(url: string) {
  return new Promise((resolve, reject) => {
    // JSZipUtils.getBinaryContent(url, (err, data) => {
    //   if (err) {
    //     reject(err);
    //   } else {
    //     resolve(data);
    //   }
    // });
    urlToBuf(url)
      .then((res) => {
        resolve(res);
      })
      .catch((error) => {
        reject(error);
      });
  }).then((files) => {
    //  step2 解压
    return JSZip.loadAsync(files);
  });
}
type Zip = {
  files: {
    [key: string]: {
      [key: string]: any;
    };
  };
};
/**
 * 根据zip的file文件对象解析成jszip对象
 * @param file
 * @returns Promise<Zip>
 */
export function loadZipFile(file: File) {
  return new Promise<Zip>((resolve, reject) => {
    file
      .arrayBuffer()
      .then((buffer) => {
        JSZip.loadAsync(buffer)
          .then((res) => {
            resolve(res);
          })
          .catch((error) => {
            console.error('加载zip文件失败:', error);
            reject(error);
          });
      })
      .catch((error) => {
        console.error('读取文件失败:', error);
        reject(error);
      });
  });
}
/**
 * 将file对象转为url
 * @param file
 * @returns string
 */
export const fileToUrl = (file: File) => {
  let url = '';
  if (URL.createObjectURL && URL.createObjectURL !== undefined) {
    url = URL.createObjectURL(file);
  } else if (window.webkitURL !== undefined) {
    // webkit or chrome
    try {
      url = window.webkitURL.createObjectURL(file);
    } catch (error) {
      message.error(error as string);
    }
  } else if (window.URL !== undefined) {
    // mozilla(firefox)
    try {
      url = window.URL.createObjectURL(file);
    } catch (error) {
      message.error(error as string);
    }
  }
  return url;
};
type prevFileObj = {
  fileId: string;
  fileName: string;
  imgHeight: string;
  imgWidth: string;
  type: string;
  url: string;
};

/**
 * 将JSZip.loadAsync返回的jszip对象转换成zip文件的预览列表
 * @param zip
 * @returns Promise<prevFileObj[]>
 */
export function getPreviewList(zip) {
  return new Promise<prevFileObj[]>((resolve, reject) => {
    // 只取图片和pdf
    const filenames = Object.keys(zip.files).filter((item) => {
      const innerTestmsg = zip.files[item].name
        .slice(Math.max(0, zip.files[item].name.lastIndexOf('.') + 1))
        .toLowerCase();
      return (
        !zip.files[item].dir &&
        ['gif', 'jpeg', 'jpg', 'pdf', 'png'].includes(innerTestmsg)
      );
    });
    const promises = filenames.map((name, index) => {
      const obj = zip.files[name];
      return handleOneFileToObj(obj, name, index);
    });
    Promise.all(promises)
      .then((res) => {
        resolve(res.filter(Boolean));
      })
      .catch((error) => {
        reject(error);
      });
  });
}
/**
 * 将JSZip.loadAsync返回的files对象的属性转换为预览对象
 * @param obj
 * @param name
 * @param index
 * @returns Promise<prevFileObj>
 */
export function handleOneFileToObj(obj: any, name: string, index: number) {
  return new Promise<prevFileObj>((resolve, reject) => {
    obj
      .async('arraybuffer')
      .then((fileData) => {
        const typeStr = name
          .slice(Math.max(0, name.lastIndexOf('.') + 1))
          .toLowerCase();
        let type: string = '';
        if (['gif', 'jpeg', 'jpg', 'png'].includes(typeStr)) {
          type = 'image/jpeg';
        } else if (typeStr === 'pdf') {
          type = 'application/pdf';
        } else {
          return;
        }
        const blob = new Blob([fileData], { type });
        const url = window.webkitURL.createObjectURL(blob);
        const midObj: prevFileObj = {
          fileId: `zip-pic${index}`,
          fileName: name,
          imgHeight: '',
          imgWidth: '',
          type: name.includes('pdf') ? 'pdf' : 'img',
          url: '',
        };
        midObj.url = url;
        resolve(midObj);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
/**
 * 通过 a标签结合文件路径下载文件
 * 跨域的场景下，无法自定义文件名
 * @params fileName 文件名
 * @params fileUrl 文件路径
 */
export function downloadFileByLink(fileName: string, fileUrl: string) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = fileName;
  link.click();
  link.remove();
}

/**
 * 通过fetch方法，获取文件的文件流，然后再通过a标签下载
 * 该方法可以完全自定义文件名
 * @params fileName 文件名
 * @params fileUrl 文件路径
 */
export function downloadFileByBlob(fileName: string, fileUrl: string) {
  // 将url转成blob地址
  fetch(fileUrl)
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.createElement('a');
      // 将链接地址字符内容转变成blob地址
      a.href = URL.createObjectURL(blob);
      a.download = fileName; // 下载文件的名字
      document.body.append(a);
      a.click();
      // 下载完成后 清除占用的缓存资源
      window.URL.revokeObjectURL(a.href);
      a.remove();
    });
}
/**
 * 通过fetch方法，获取文件的文件流，然后再通过blob转成arrayBuffer
 * 该方法可以完全替代 JSZipUtils 库，实现获取arrayBuffer功能
 * @params fileUrl 文件路径
 */
export function urlToBuf(fileUrl) {
  return new Promise((resolve, reject) => {
    fetch(fileUrl)
      .then((res) => res.blob())
      .then((blob) => {
        blob
          .arrayBuffer()
          .then((buffer) => {
            resolve(buffer);
          })
          .catch((error) => {
            reject(error);
          });
      });
  });
}
