import React, { Component } from 'react';
import { Form, Icon, Input,Radio,Button,Upload} from 'antd';
import './Add.css';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
//form代码，没有什么改进，把下面的提交按钮去掉就行
class NormalLoginForm extends Component {
    constructor(props){
        super(props);
        this.state = this.props.item;
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        let newState = {};
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
               newState = {
                    addObj:values
                }
            }
            this.props.onChange(newState);
        });
        this.props.form.resetFields();
    };
    normFile = (e) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 14 },
        };
        return (
            <Form onSubmit={this.props.handleSubmit}>
                <FormItem
                    {...formItemLayout}
                    label="样本集名称"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 12 }}
                >
                    {getFieldDecorator('name', {
                    /*    rules: [{ required: true, message: '请输入样本集名称' }],*/
                    })(
                        <Input />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="样本集描述"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 12 }}
                >
                    {getFieldDecorator('desc', {
                    })(
                        <TextArea rows={4} />
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="样本集导入方式"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 12 }}
                >
                    {getFieldDecorator('downType',{initialValue:'1'})(
                        <RadioGroup>
                            <Radio value="1">本地数据导入</Radio>
                            <Radio value="2">OS对象数据同步</Radio>
                        </RadioGroup>
                    )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    className="uploadFormItem"
                    label="样本集上传文件"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 12 }}
                >
                    {getFieldDecorator('upload', {
                        valuePropName: 'fileList',
                        getValueFromEvent: this.normFile,
                    })(
                        <Upload name="logo" action="/upload.do" listType="picture">
                            <Button className="uploadButton">
                                <Icon type="plus" />
                            </Button>
                        </Upload>
                    )}
                </FormItem>
                <FormItem
                    wrapperCol={{ span: 12, offset: 6 }}
                >
                    <Button type="primary" htmlType="submit" className="submit" onClick={this.handleSubmit}>提交</Button>
                </FormItem>

            </Form>
        );
    }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);

export default WrappedNormalLoginForm;