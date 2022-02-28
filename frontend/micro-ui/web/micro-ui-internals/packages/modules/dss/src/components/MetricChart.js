import { DownwardArrow, Rating, UpwardArrow } from "@egovernments/digit-ui-react-components";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FilterContext from "./FilterContext";
//import {ReactComponent as Arrow_Downward} from "../images/Arrow_Downward.svg";
import { ArrowDownwardElement } from "./ArrowDownward";
import { ArrowUpwardElement } from "./ArrowUpward";

const MetricData = ({ t, data, code }) => {
  const { value } = useContext(FilterContext);
  return (
    <div>
      <p className="heading-m" style={{ textAlign: "right", paddingTop: "0px", whiteSpace: "nowrap" }}>
        {code === "citizenAvgRating" ? (
          <Rating currentRating={Math.round(data?.headerValue * 10) / 10} styles={{ width: "unset" }} starStyles={{ width: "25px" }} />
        ) : (
          `${Digit.Utils.dss.formatter(data?.headerValue, data?.headerSymbol, value?.denomination, true)} ${
            code === "totalSludgeTreated" ? t(`DSS_KL`) : ""
          }`
        )}
      </p>
      {data?.insight && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "end",
          }}
        >
          {data?.insight?.indicator === "upper_green" ? ArrowUpwardElement("10px") : ArrowDownwardElement("10px")}
          <p className={`${data?.insight.colorCode}`} style={{ whiteSpace: "pre" }}>
            {data?.insight.value.replace(/[+-]/g, "").replace("last year", "LY")}
          </p>
        </div>
      )}
    </div>
  );
};

const MetricChartRow = ({ data, setChartDenomination, index }) => {
  const { id, chartType } = data;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { t } = useTranslation();
  const { value } = useContext(FilterContext);
  const [showDate, setShowDate] = useState({});
  const { isLoading, data: response } = Digit.Hooks.dss.useGetChart({
    key: id,
    type: chartType,
    tenantId,
    requestDate: { ...value?.requestDate, startDate: value?.range?.startDate?.getTime(), endDate: value?.range?.endDate?.getTime() },
    filters: value?.filters,
  });

  useEffect(() => {
    if (response) {
      let plots = response?.responseData?.data?.[0]?.plots || null;
      if (plots && Array.isArray(plots) && plots.length > 0 && plots?.every((e) => e.value))
        setShowDate(oldstate=>({...oldstate,[id]:{
          todaysDate: Digit.DateUtils.ConvertEpochToDate(plots?.[0]?.value),
          lastUpdatedTime: Digit.DateUtils.ConvertEpochToTimeInHours(plots?.[1]?.value),
        }}));
      index === 0 && setChartDenomination(response?.responseData?.data?.[0]?.headerSymbol);
    } else {
      setShowDate({});
    }
  }, [response]);

  if (isLoading) {
    return false;
  }

  if (!response) {
    return (
      <div style={{ position: "relative", display: "flex", height:"68px",justifyContent: "space-between" }}>
        <span>{t(data.name)}</span>
        <span style={{ whiteSpace: "pre" }}>{t("DSS_NO_DATA")}</span>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="tooltip">
        {t(data.name)}

        <span style={{ whiteSpace: "pre-line", display: "block" }}> {showDate?.[id]?.todaysDate}</span>
        <span
          className="tooltiptext"
          style={{
            whiteSpace: "nowrap",
            // marginLeft: "-500%" ,
            fontSize: "medium",
          }}
        >
          <span style={{ fontWeight: "500", color: "white" }}>{t(`TIP_${data.name}`)}</span>
          <span style={{ color: "white" }}> {showDate?.[id]?.lastUpdatedTime}</span>
        </span>
      </div>
      <MetricData t={t} data={response?.responseData?.data?.[0]} code={response?.responseData?.visualizationCode} />
      {/* <div>{`${displaySymbol(response.headerSymbol)} ${response.headerValue}`}</div> */}
    </div>
  );
};

const MetricChart = ({ data, setChartDenomination }) => {
  const { charts } = data;
  return (
    <>
      {charts.map((chart, index) => (
        <MetricChartRow data={chart} key={index} index={index} setChartDenomination={setChartDenomination} />
      ))}
    </>
  );
};

export default MetricChart;
