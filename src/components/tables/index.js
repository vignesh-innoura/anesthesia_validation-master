import React, { useEffect, useState } from "react";
import TableStyle from "./styles.module.css";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Avatar,
  Tooltip,
  notification,
  Select as AntSelect,
  Empty,
  Button,
  Modal,
} from "antd";

import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  EditOutlined,
  StarFilled,
} from "@ant-design/icons";
import axios from "axios";
import MultipleViewersSamePageExample from "../../upload/PdfViewFile";

function PatientTable({
  patinetListAll = [],
  actionBodyTemplate,
  statusBodyTemplate,
  patientDetails,
  paginationFirst,
  totalElements,
  onPageChange,
}) {
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrder1, setSortOrder1] = useState("asc");
  const [fileID, setFileID] = useState(null);
  const [data, setData] = useState([]);
  const [selectRowData, setSelectRowData] = useState();
  const [editIndex, setEditIndex] = useState(null);
  const [pageNum, setPageNum] = useState();
  const [openPDF, setOpenPDF] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [editedRows, setEditedRows] = useState([]);
  const [editedValuesRow, setEditedValuesRow] = useState();
  const openPdfViewer = (pageNumber) => {
    const apiUrl = `https://anesthesia.encipherhealth.com/api/v1/file/${fileID}`;

    setPageNum(pageNumber);
    setOpenPDF(true);
    setShowPdfViewer(true);
  };

  const displatTable = async (id) => {
    try {
      if (id) {
        setFileID(id);
        const response = await axios.get(
          `https://anesthesia.encipherhealth.com/api/v1/anesthesia/${id}`
        );

        if (response?.data) {
          setData(response?.data?.value);
        }
      }
    } catch (error) {
      console.error("Error fetching file list:", error);
    }
  };

  console.log(data);
  useEffect(() => {
    displatTable("3360d4ee-2245-4710-beb8-d91055b021dc");
  }, []);
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

  return (
    <div className={TableStyle.classContaineer}>
      <table className={TableStyle.classTable}>
        <thead className={TableStyle.classThead}>
          <tr>
            <th className={TableStyle.startTitles} colSpan={6}></th>
            <th className={TableStyle.title} colSpan={4} align="center">TIME</th>
            <th className={TableStyle.endtitles} colSpan={4}></th>
            <th style={{width: '10px'}}></th>
            <th className={TableStyle.subsTitle} colSpan={4}>Diagnosis</th>
          </tr>
          <tr>
            <th className={TableStyle.bottomTitles}>SI.No</th>
            <th className={TableStyle.title}>Patient Name</th>

            <th className={TableStyle.title} onClick={sortTableByAsc}>
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  height: "50px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Page No{" "}
                <div style={{ paddingLeft: "3px" }}>
                  {sortOrder === "asc" ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}
                </div>
              </div>
            </th>
            <th className={TableStyle.title}>Date of Service</th>
            <th className={TableStyle.title}>Anesthesiologist</th>
            <th className={TableStyle.title}>CRNA</th>

            <th className={TableStyle.title}>ST </th>
            <th className={TableStyle.title}> ET </th>
            <th className={TableStyle.title}>TU</th>
            <th className={TableStyle.title}>TTM</th>

            <th className={TableStyle.title}>Anesthesia Type</th>
            <th className={TableStyle.title}>Physical Modifier </th>

            <th className={TableStyle.title}>
              <div
                style={{
                  cursor: "pointer",
                  display: "flex",
                  height: "50px",
                  alignItems: "center",
                }}
              >
                Modifier{" "}
                <div style={{ paddingLeft: "3px" }}>
                  {sortOrder1 === "asc" ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}
                </div>
              </div>
            </th>

            <th className={TableStyle.endBottomtitles}>ASA Code </th>
            <th style={{width: '10px'}}></th>
            <th className={TableStyle.subTitless}>D 1</th>
            <th className={TableStyle.subTitle}>D 2</th>
            <th className={TableStyle.subTitle}>D 3</th>
            <th className={TableStyle.subTitles}>D 4</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {data?.length > 0 &&
            data?.map((item, index) => {
              const hasDiagnosisData =
                item?.diagnosis[0] ||
                item?.diagnosis[1] ||
                item?.diagnosis[2] ||
                item?.diagnosis[3];
              const rowStyle = hasDiagnosisData
                ? {}
                : { backgroundColor: "#e08515" };
              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectRowData(item)}
                  style={rowStyle}
                  className="my-2"
                >
                  <td className={`border-start border-top border-bottom`}>{index + 1}</td>

                  <td className={TableStyle.bodyContant}>{item?.patientName}</td>

                  <td
                    onClick={() => {
                      if (editIndex !== index) {
                        openPdfViewer(item.pageNo - 1);
                        setEditMode(false);
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {item?.pageNo}
                  </td>
                  <td>{item?.dateOfService}</td>

                  {/* <td>
                          <>
                            {item?.anesthesiologistData?.[0]?.supervisorName ||
                              "-"}
                          </>
                        </td> */}
                  <td>
                    {item?.anesthesiologistData?.[0]?.supervisorName ? (
                      <>
                        {
                          item.anesthesiologistData[0].supervisorName.split(
                            " "
                          )[0]
                        }
                        {item.anesthesiologistData.length > 1 &&
                        item.anesthesiologistData[0].supervisorName.split(" ")
                          .length > 1 ? (
                          <StarFilled />
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* <td>
                          {item?.anesthesiologistData?.[0]?.crnaName || "-"}
                        </td> */}
                  <td>
                    {item?.anesthesiologistData?.[0]?.crnaName ? (
                      <>
                        {item.anesthesiologistData[0].crnaName.split(" ")[0]}
                        {item.anesthesiologistData.length > 1 &&
                        item.anesthesiologistData[0].crnaName.split(" ")
                          .length > 1 ? (
                          <StarFilled />
                        ) : (
                          ""
                        )}
                      </>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>{item?.startTime}</td>
                  <td>{item?.endTime}</td>
                  <td>{item?.timeUnit}</td>
                  <td>{item?.timeInMinutes}</td>
                  <td>{item?.anesthesiaType}</td>
                  <td>{item?.physicalModifier}</td>
                  <td>{item?.qs}</td>
                  <td>{item?.asaCode}</td>
                  <td style={{maxWidth: '10px', padding: 0}}></td>
                  <td
                  className={TableStyle.diagnosis1}
                    // style={{
                    //   backgroundColor: hasDiagnosisData ? "#eee4ff" : "#e08515",
                    // }}
                  >
                    {item?.diagnosis[0] || null}
                  </td>
                  <td
                  className={TableStyle.diagnosis}
                    // style={{
                    //   backgroundColor: hasDiagnosisData ? "#eee4ff" : "#e08515",
                    // }}
                  >
                    {item?.diagnosis[1] || null}
                  </td>
                  <td
                  className={TableStyle.diagnosis}
                    // style={{
                    //   backgroundColor: hasDiagnosisData ? "#eee4ff" : "#e08515",
                    // }}
                  >
                    {item?.diagnosis[2] || null}
                  </td>
                  <td
                  className={TableStyle.diagnosis2}
                    // style={{
                    //   backgroundColor: hasDiagnosisData ? "#eee4ff" : "#e08515",
                    // }}
                  >
                    {item?.diagnosis[3] || null}
                  </td>

                  <td>
                    <div style={{ zIndex: "999" }}>
                            <Button
                              onClick={() => {
                                openPdfViewer(item.pageNo - 1);
                                handleEditClickRow();
                              }}
                            >
                              <EditOutlined style={{ cursor: "pointer" }} />
                            </Button>
                          </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div></div>
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

export default PatientTable;
