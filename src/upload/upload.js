import { Button, Modal, Progress, Select } from "antd";
import "../App.css";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  EditOutlined,
  StarFilled,
} from "@ant-design/icons";
import image1 from "../photos/Encipher Health Logo.png";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import MultipleViewersSamePageExample from "./PdfViewFile";
import { Option } from "antd/es/mentions";
import NewHeader from "../components/new-header";
import PatientTable from "../components/tables";
// import Header from "../components/header/Header";

function UploadFile() {
  const [fileInfoList, setFileInfoList] = useState([]);
  const [file, setFile] = useState(null);
  const [fileID, setFileID] = useState(null);
  const [data, setData] = useState([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrder1, setSortOrder1] = useState("asc");
  const [editIndex, setEditIndex] = useState(null);
  const [filename, setFileName] = useState(null);
  const [openPDF, setOpenPDF] = useState(false);
  const [pageNum, setPageNum] = useState();
  const [editedRows, setEditedRows] = useState([]);
  const [selectRowData, setSelectRowData] = useState();
  const [showPdfViewer, setShowPdfViewer] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [editedValuesRow, setEditedValuesRow] = useState();

  const handleChangeExport = (value) => {
    console.log(value);

    // Check if the selected value is 'Excel'
    if (value && value.value === "Excel") {
      handleDownload(fileID);
    }

    // Add your logic here
  };

  // const handleDownloadExport = (fileId) => {
  //   // Your logic for handling the download
  //   console.log('Downloading file with ID:', fileId);
  //   // Add the rest of your download logic here
  // };

  const handleEditClickRow = () => {
    setEditMode(true);
    const existingDiagnosis = selectRowData?.diagnosis || [];
    const existingQs = selectRowData?.qs || [];

    setEditedValuesRow({
      patientName: selectRowData?.patientName || "",
      patientId: selectRowData?.patientId || "",
      fileId: selectRowData?.fileId || "",
      pageNo: selectRowData?.pageNo || "",
      dateOfService: selectRowData?.dateOfService || "",
      anesthesiologistData: [
        {
          supervisorName:
            selectRowData?.anesthesiologistData?.[0]?.supervisorName || null,
          crnaName: selectRowData?.anesthesiologistData?.[0]?.crnaName || null,
        },
      ],
      startTime: selectRowData?.startTime || "",
      endTime: selectRowData?.endTime || "",
      timeUnit: selectRowData?.timeUnit || "",
      timeInMinutes: selectRowData?.timeInMinutes || "",
      anesthesiaType: selectRowData?.anesthesiaType || "",
      physicalModifier: selectRowData?.physicalModifier || "",
      qs: selectRowData?.qs || "",
      //qs : [...existingQs]
      asaCode: selectRowData?.asaCode || "",
      diagnosis: [...existingDiagnosis],
    });
  };
  const handleEditChangeRow = (field, value, index) => {
    setEditedValuesRow((prevValues) => {
      const prevDiagnosis = prevValues.diagnosis || [];

      if (field.startsWith("diagnosis")) {
        const updatedDiagnosis = [...prevDiagnosis];
        updatedDiagnosis[index] = value;
        return {
          ...prevValues,
          [field]: value,
          diagnosis: updatedDiagnosis,
        };
      }
      
      
      else if (field === "supervisorName" || field === "crnaName") {
        const updatedAnesthesiologistData =
          prevValues.anesthesiologistData?.map((item) => {
            if (field === "supervisorName") {
              return { ...item, supervisorName: value };
            } else if (field === "crnaName") {
              return { ...item, crnaName: value };
            }
            return item;
          });
        return {
          ...prevValues,
          // [field]: value,
          anesthesiologistData: updatedAnesthesiologistData,
        };
      } else {
        return {
          ...prevValues,
          [field]: value,
        };
      }
    });
  };

  const handleSaveClickRow = async () => {
    const updatedData = [...editedRows];
    updatedData[editMode] = {
      ...updatedData[editMode],
      ...editedValuesRow,
    };
    setEditedRows(updatedData);
    try {
      const response = await fetch(
        "https://anesthesia.encipherhealth.com/api/v1/patient-record/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData[editMode]),
        }
      );
      if (response.ok) {
        setSelectRowData(editedValuesRow);

        setEditMode(null);
      } else {
        console.error("Error saving data:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const openPdfViewer = (pageNumber) => {
    const apiUrl = `https://anesthesia.encipherhealth.com/api/v1/file/${fileID}`;

    setPageNum(pageNumber);
    setOpenPDF(true);
    setShowPdfViewer(true);
  };
  const openPdfViewer1 = (pageNumber) => {
    const apiUrl = `https://anesthesia.encipherhealth.com/api/v1/file/${fileID}`;

    setPageNum(pageNumber);
    setOpenPDF(true);
    setShowPdfViewer(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  useEffect(() => {
    //progress bar function
    if (progress > 0) {
      const intervalId = setInterval(() => {
        if (progress >= 99) {
          clearInterval(intervalId); // Clear the interval when progress reaches 99
        } else {
          setProgress(progress + 1);
        }
      }, 500);

      // Cleanup function to clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [progress]);
  
  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
    //upload api
    try {
      const formData = new FormData();
      formData.append("file", file);
      setFileName(file?.name);
      setProgress(1);
      const response = await axios.post(
        "https://anesthesia.encipherhealth.com/api/v1/fileUpload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response) {
        setProgress(100);
        fetchFileList();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const fetchFileList = async () => {
    try {
      const response = await axios.get(
        "https://anesthesia.encipherhealth.com/api/v1/files"
      );

      if (response?.data) {
        const info = response?.data?.value;
        const fieldId = info[info?.length - 1]?.fileId;

        displatTable(fieldId);
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
    }
  };
  const displatTable = async (id) => {
    try {
      if (id) {
        setFileID(id)
        const response = await axios.get(
          `https://anesthesia.encipherhealth.com/api/v1/anesthesia/${id}`
        );

        if (response?.data) {
          setData(response?.data?.value)
          
        }
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
    }
  };



  //list show api
  // const fetchFileList = async () => {
  //   try {
  //     const response = await fetch(
  //       "https://anesthesia.encipherhealth.com/api/v1/files"
  //     );

  //     const data = await response.json();

  //     setFileInfoList(data);
  //   } catch (error) {
  //     console.error("Error fetching file list:", error);
  //   }
  // };
  //download api
  const handleDownload = async (fileId) => {
   
    const res = await axios
      .get(
        `https://anesthesia.encipherhealth.com/api/v1/patient-record/download/${fileId}`
      )
      .then((res) => res.data.value);
      console.log(res.data)
    const link = document.createElement("a");
    link.href = res.downloadUrl;
    link.setAttribute("download", "downloaded_excel.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // useEffect(() => {
  //   if (!fileInfoList.length) {
  //     fetchFileList();
  //   }
  // }, [fileInfoList]);

  // useEffect(() => {
  //   fetchFileList();
  //   // fetchDataTable();
  // }, []);
  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 3000);
    }
  }, [progress]);
  //tables view api
  // useEffect(() => {
  // if(fileID){
  //   fetch(`https://anesthesia.encipherhealth.com/api/v1/anesthesia/${fileID}`)
  //   .then((response) => response.json())
  //   .then((specificPatientData) => {

  //     const data = specificPatientData?.value

  //     // Set the specific patient data to the state

  //     setData(data);

  //   });
  // }
  // }, [fileID ]);

  // useEffect(() => {
  //   fetch(`https://anesthesia.encipherhealth.com/api/v1/anesthesia/${fileID}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // Find the specific patient data you want to set
  //       const specificPatientData = data.value.find(patient => patient.patientId === '658e979ff95d0237cb921ec5');

  //       // Set the specific patient data to the state
  //       setData(specificPatientData);
  //     });
  // }, [fileID]);

  // sort by order
  const sortTableByAsc = async () => {
    try {
      const response = await axios.get(
        `https://anesthesia.encipherhealth.com/api/v1/patient-record/sort/${fileID}`,
        {
          params: {
            sortBy: "pageNo",
            order: sortOrder === "asc" ? "desc" : "asc",
          },
        }
      );
      setData(response?.data?.value); // Assuming your API returns the sorted data
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } catch (error) {
      console.error("Error fetching sorted data:", error);
    }
  };
  const sortTableByAsc1 = async () => {
    try {
      const response = await axios.get(
        `https://anesthesia.encipherhealth.com/api/v1/patient-record/sort/${fileID}`,
        {
          params: {
            sortBy: "qs",
            order: sortOrder1 === "asc" ? "desc" : "asc",
          },
        }
      );
      setData(response?.data?.value); // Assuming your API returns the sorted data
      setSortOrder1(sortOrder1 === "asc" ? "desc" : "asc");
    } catch (error) {
      console.error("Error fetching sorted data:", error);
    }
  };
  // const tableShow = ()=>{
  //   setFileID(fileInfoList[fileInfoList?.length - 1]?.fileId)
  // }

  const replaceValues = (patientId, editedValuesRow) => {
    setData((prevDatas) => {
      return prevDatas
        ? prevDatas.map((data) => {
            if (data.patientId === patientId) {
              return editedValuesRow;
            }
            return data;
          })
        : prevDatas;
    });
  };
  console.log(selectRowData)

  return (
    <div >
      {/*    */}
      <NewHeader/>
      <PatientTable />
      

      {openPDF && (
        <Modal
          open={openPDF}
          onOk={() => {
            replaceValues(selectRowData?.patientId, editedValuesRow);
            setOpenPDF(false);
          }}
          onCancel={() => setOpenPDF(false)}
          style={{ marginTop: "-50px" }}
          width="90%"
          height="auto"
        >
          <div style={{ display: "flex", width: "100%" }}>
            <div style={{ width: "100%" }}>
              <MultipleViewersSamePageExample
                fileID={fileID}
                pageNumber={pageNum}
              />
            </div>

            {showPdfViewer && (
              <div
                style={{
                  width: "30%",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  backgroundColor: "#E4E7E7",
                }}
              >
                {selectRowData && (
                  <div c>
                    <h4>Selected Row Data</h4>
                    <div></div>

                    <div class="values">
                      <div>Patient Name</div>

                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.patientName}
                          onChange={(e) =>
                            handleEditChangeRow("patientName", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData.patientName}</div>
                      )}

                      <div>Page No</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.pageNo}
                          onChange={(e) =>
                            handleEditChangeRow("pageNo", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.pageNo}</div>
                      )}
                      <div>DOS</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.dateOfService}
                          onChange={(e) =>
                            handleEditChangeRow("dateOfService", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.dateOfService}</div>
                      )}
                      <div>Anesthesiologist</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={
                            editedValuesRow?.anesthesiologistData?.[0]
                              ?.supervisorName
                          }
                          onChange={(e) =>
                            handleEditChangeRow(
                              "supervisorName",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div>
                          {/* {
                            selectRowData?.anesthesiologistData?.[0]
                              ?.supervisorName
                          } */}
                          {selectRowData?.anesthesiologistData
      ?.map((item) => item.supervisorName)
      ?.join(', ')}
                        </div>
                      )}
                      <div>CRNA</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={
                            editedValuesRow?.anesthesiologistData?.[0]?.crnaName
                          }
                          onChange={(e) =>
                            handleEditChangeRow("crnaName", e.target.value)
                          }
                        />
                      ) : (
                        <div>
                          {/* {selectRowData?.anesthesiologistData?.[0]?.crnaName} */}
                          {selectRowData?.anesthesiologistData
      ?.map((item) => item.crnaName)
      ?.join(', ')}
                        </div>
                      )}
                      <div>Start Time</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.startTime}
                          onChange={(e) =>
                            handleEditChangeRow("startTime", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.startTime}</div>
                      )}
                      <div>End Time</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.endTime}
                          onChange={(e) =>
                            handleEditChangeRow("endTime", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.endTime}</div>
                      )}
                      <div>Time Unit</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.timeUnit}
                          onChange={(e) =>
                            handleEditChangeRow("timeUnit", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.timeUnit}</div>
                      )}
                      <div>Total time in Minutes</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.timeInMinutes}
                          onChange={(e) =>
                            handleEditChangeRow("timeInMinutes", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.timeInMinutes}</div>
                      )}
                      <div>Anesthesia Type</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.anesthesiaType}
                          onChange={(e) =>
                            handleEditChangeRow(
                              "anesthesiaType",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div>{selectRowData?.anesthesiaType}</div>
                      )}
                      <div>Physical Modifier</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.physicalModifier}
                          onChange={(e) =>
                            handleEditChangeRow(
                              "physicalModifier",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div>{selectRowData?.physicalModifier}</div>
                      )}
                      <div>Modifier</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.qs}
                          onChange={(e) =>
                            handleEditChangeRow("qs", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.qs}</div>
                      )}
                      <div>ASA</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.asaCode}
                          onChange={(e) =>
                            handleEditChangeRow("asaCode", e.target.value)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.asaCode}</div>
                      )}
                      {/* <div>ASA</div>
{editMode ? (
  <input
    type="text"
    value={editedValuesRow?.asaCode.join(", ")} // Join the array values with a comma and space
    onChange={(e) =>
      handleEditChangeRow("asaCode", e.target.value.split(", "))
    }
  />
) : (
  <div>
    {selectRowData?.asaCode.length > 1
      ? `${selectRowData?.asaCode[0]}, ${selectRowData?.asaCode[1]}`
      : selectRowData?.asaCode[0]}
  </div>
)} */}
                      <div>Diagnosis 1</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.diagnosis[0]}
                          onChange={(e) =>
                            handleEditChangeRow("diagnosis", e.target.value, 0)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.diagnosis[0]}</div>
                      )}

                      <div>Diagnosis 2</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.diagnosis[1]}
                          onChange={(e) =>
                            handleEditChangeRow("diagnosis", e.target.value, 1)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.diagnosis[1]}</div>
                      )}

                      <div>Diagnosis 3</div>

                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.diagnosis[2]}
                          onChange={(e) =>
                            handleEditChangeRow("diagnosis", e.target.value, 2)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.diagnosis[2]}</div>
                      )}

                      <div>Diagnosis 4</div>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedValuesRow?.diagnosis[3]}
                          onChange={(e) =>
                            handleEditChangeRow("diagnosis", e.target.value, 3)
                          }
                        />
                      ) : (
                        <div>{selectRowData?.diagnosis[3]}</div>
                      )}

                      {!editMode && (
                        <Button
                          className="editButton"
                          onClick={handleEditClickRow}
                        >
                          Edit
                        </Button>
                      )}

                      {editMode && (
                        <>
                          <Button onClick={handleSaveClickRow}>Save</Button>
                          <Button onClick={() => setEditMode(false)}>
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UploadFile;

// const handleUpload = async () => {
//   if (!file) {
//     console.error("No file selected");
//     return;
//   }

//   // Upload API
//   try {
//     const formData = new FormData();
//     formData.append("file", file);
//     setProgress(1);
//     const response = await axios.post(
//       "https://anesthesia.encipherhealth.com/api/v1/fileUpload",
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );

//     if (response.data === "File uploaded successfully ") {
//       setProgress(100);
//       const uploadedFileId = response.data.fileId; // Adjust this based on the actual response structure
//       setFileID(uploadedFileId);
//       fetchFileList(); // This might not be necessary, depending on your use case
//     }

//     console.log(response.data);
//   } catch (error) {
//     console.error("Error uploading file:", error);
//   }
// };
