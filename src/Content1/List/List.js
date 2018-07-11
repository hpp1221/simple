import React, {Component} from 'react';
import {Input, Button, Table, Modal, Popconfirm, Form, InputNumber, Divider} from 'antd';
import './List.css';
import WrappedNormalLoginForm from '../Add/Add';

const EditableContext = React.createContext();
const EditableRow = ({form, index, ...props}) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);
const FormItem = Form.Item;
const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber/>;
        }
        return <Input/>;
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            ...restProps
        } = this.props;
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const {getFieldDecorator} = form;
                    return (
                        <td {...restProps}>
                            {editing ? (
                                <FormItem style={{margin: 0}}>
                                    {getFieldDecorator(dataIndex, {
                                        rules: [{
                                            required: true,
                                            message: `Please Input ${title}!`,
                                        }],
                                        initialValue: record[dataIndex],
                                    })(this.getInput())}
                                </FormItem>
                            ) : restProps.children}
                        </td>
                    );
                }}
            </EditableContext.Consumer>
        );
    }
}

class TabsControl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0
        };
    }

    check_title_index(index) {
        return index === this.state.currentIndex ? "tab_title active" : "tab_title"
    }

    check_item_index(index) {
        return index === this.state.currentIndex ? "tab_item show" : "tab_item"
    }

    render() {
        // let _this = this
        return (
            <div>
                {/* 动态生成Tab导航 */}
                <div className="tab_title_wrap">
                    {
                        React.Children.map(this.props.children, (element, index) => {
                            return (
                                <div onClick={() => {
                                    this.setState({currentIndex: index}, () => {
                                    })
                                }} className={this.check_title_index(index)}>{element.props.name}</div>
                            )
                        })
                    }
                </div>
                {/* Tab内容区域 */}
                <div className="tab_item_wrap">
                    {
                        React.Children.map(this.props.children, (element, index) => {
                            return (
                                <div className={this.check_item_index(index)}>{element}</div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

class List extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            confirmLoading: false,
            selectedRows: [],
            searchValue: ''
        };
        this.handleChildChange = this.handleChildChange.bind(this);
        this.columns = [
            {
                title: '样本集ID', dataIndex: 'id', key: 'id',
            },
            {
                title: '样本集名称', dataIndex: 'name', key: 'name', editable: true
            },
            {
                title: '样本集描述', dataIndex: 'desc', key: 'desc', editable: true
            },
            {
                title: '创建时间',
                dataIndex: 'createtime',
                key: 'createtime',
                defaultSortOrder: 'descend',
                // sorter: (a, b) => a.createtime - b.createtime,
            },
            {
                title: '更新时间',
                dataIndex: 'updatetime',
                key: 'updatetime',
                defaultSortOrder: 'descend',
                // sorter: (a, b) => a.updatetime - b.updatetime,
            },
            {
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text, record) => {
                    const editable = this.isEditing(record);
                    return (
                        this.state.tableData.length > 1 ?
                            <div>
                                {editable ? (
                                    <span>
                  <EditableContext.Consumer>
                    {form => (
                        <a onClick={() => this.save(form, record.id)} style={{marginRight: 8}}>保存</a>
                    )}
                  </EditableContext.Consumer>

                  <Popconfirm
                      title="Sure to cancel?"
                      onConfirm={() => this.cancel(record.id)}
                  >
                    <a>取消</a>
                  </Popconfirm>
                </span>
                                ) : (
                                    <a onClick={() => this.edit(record.id)}>编辑</a>
                                )}
                                <Divider type="vertical"/>
                                <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.id)}>
                                    <a>删除</a>
                                </Popconfirm>
                            </div> : null
                    )
                }
            }
        ];
    }

    componentDidMount() {
        let url = "http://192.168.10.34:3000/samplelist";
        fetch(url).then((res) => {
            return res.json()
        }).then((res) => {
            this.setState({tableData: res});
        });
    };

    /*    编辑 begin*/
    isEditing = (record) => {
        return record.id === this.state.editingKey;
    };

    edit(key) {
        this.setState({editingKey: key});
    }

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.tableData];
            row['id'] = key;
            row['updatetime'] = this.getNowFormatDate();
            const index = newData.findIndex(item => key === item.id);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({tableData: newData, editingKey: ''});
            } else {
                newData.push(this.state.tableData);
                this.setState({tableData: newData, editingKey: ''});
            }
        });
    }

    cancel = () => {
        this.setState({editingKey: ''});
    };

    /*    编辑 end*/
    handleInput(e) {
        let value = e.target.value;
        this.setState({
            keyword: value
        }, () => {
        });
    };

    select = () => {
        let url = "http://192.168.10.34:3000/samplelist/" + this.state.keyword;
        let newSelectData = [];
        fetch(url).then((res) => {
            return res.json()
        }).then((res) => {
            newSelectData.push(res);
            this.setState({tableData: newSelectData});
        })
    };//简单搜索
    onDelete = (key) => {
        const tableData = [...this.state.tableData];
        this.setState({tableData: tableData.filter(item => item.id !== key)});
    };//删除操作
    onDeleteMulti = () => {
        const selectedRows = [...this.state.selectedRows];
        const tableData = [...this.state.tableData];

        let tableDataNew = tableData.filter(item => !selectedRows.some(ele => ele.id === item.id));
        this.setState({tableData: tableDataNew}, () => {
            this.setState({selectedRows: []}, () => {
            })
        })

        /*        const selectedRows = [...this.state.selectedRows];
                this.setState({tableData: selectedRows.filter(item => item.id !== key)});*/
    };//多个选中删除事件
    addClick = () => {
        this.componentDidMount()
        this.setState({
            visible: true,
            addState:{},
        },()=>{});
    };//打开新增弹窗
    handleChildChange(newState) {
        console.log('newState', newState);
        console.log('newState', this.state);

        if (newState) {
            newState['addObj']['createtime'] = this.getNowFormatDate();
            newState['addObj']['updatetime'] = this.getNowFormatDate();
            this.setState({addState:newState.addObj},()=>{
                console.log('new-',this.state);
            });
            this.getAddContent(newState.addObj);

        }
    }//监听子组件变化
    getNowFormatDate = () => {
        let date = new Date();
        let seperator1 = "-";
        let seperator2 = ":";
        let month = date.getMonth() + 1;
        let strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        let currentTime = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
        return currentTime;
    };//获取当前时间
    getAddContent(newState) {
        let url = "http://192.168.10.34:3000/samplelist";
        fetch(url, {
            method: 'POST', // or 'PUT'
            body: JSON.stringify(newState), // data can be `string` or {object}!
            headers: new Headers({
                'Content-Type': 'application/json'
            })
        }).then(res => res.json())
            .catch(error => console.error('Error:', error))
            .then(res => {
                console.log('res', res);
                this.setState({
                    visible: false,
                });
                newState = {};
                this.componentDidMount()
            });
    };
    handleOk = (e) => {
        console.log();
        this.setState({
            confirmLoading: false,
            visible: true
        });//上面的代码可以忽略
        let demo = this.refs.getFormVlaue;//通过refs属性可以获得对话框内form对象
        demo.validateFields((err, values) => {
            if (!err) {
                console.log(values);//这里可以拿到数据
            }
        });
    };//点击对话框OK按钮触发的事件
    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    };//点击取消按钮触发的事件
    handleClick = (e) => {
        console.log('click ', e);
        this.setState({
            current: e.key,
        });
    };

    render() {
        const {visible, confirmLoading, tableData, selectedRows} = this.state;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const columns = this.columns.map((col) => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'age' ? 'number' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                this.setState({
                    selectedRows: selectedRows
                }, () => {
                });

            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
                name: record.name,
            }),
        };
        return (
            <div>
                <div className="selectForm">
                    <Button className="tableAdd" size="large" onClick={this.addClick}>新增</Button>
                    <Button className="search" size="large" onClick={this.select}>搜索</Button>
                    <Input placeholder="请输入ID、名称或者描述" size="large" className="middle-input" value={this.state.keyword}
                           onChange={this.handleInput.bind(this)}/>
                </div>
                <Table
                    columns={columns}
                    /*                    expandedRowRender={(record) => <p>{record.id}</p>}*/
                    expandedRowRender={(record) => this.expandedRowRenderFile(record)}
                    rowSelection={rowSelection}
                    dataSource={tableData}
                    rowKey={record => record.id}
                    bordered
                    rowClassName="editable-row"
                    components={components}
                    footer={(record) => {
                        return (
                            selectedRows.length > 0 ?
                                <div>
                                    <span>已选中{selectedRows.length}/{tableData.length}项</span><Divider
                                    type="vertical"/>
                                    <Popconfirm title="Sure to delete?"
                                                onConfirm={() => this.onDeleteMulti(record.id)}>
                                        <a>删除</a>
                                    </Popconfirm>
                                </div> : null
                        )
                        /*   return
                           <div>
                               {this.state.selectedRows.length>0 ? <span>{  '已选中'+this.state.selectedRows.length+'项'}</span> <Popconfirm title="Sure to delete?" onConfirm={() => this.onDeleteMulti}>
                                   <a>删除</a>
                                   </Popconfirm>
                                   <div>


                                   </div> : ''}

                           </div>*/
                    }
                    }
                />
                <Modal title="新建样本集"
                       visible={visible}
                       onOk={this.handleOk}
                       confirmLoading={confirmLoading}
                       onCancel={this.handleCancel}
                       footer={null}
                >
                    <WrappedNormalLoginForm item={this.state} onChange={this.handleChildChange}/>
                </Modal>
            </div>
        );
    }
}

export default List;