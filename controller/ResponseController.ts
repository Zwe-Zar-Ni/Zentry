export default class BaseController {
  static success(data: any = null, message: string = "") {
    return {
      status: 200,
      data: data,
      message: message
    };
  }
  static error(message: string = "", data: any = null) {
    return {
      status: 500,
      data: data,
      message: message
    };
  }
}
