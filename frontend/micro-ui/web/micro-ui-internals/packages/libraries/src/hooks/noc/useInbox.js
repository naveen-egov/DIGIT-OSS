import useInbox from "../useInbox"

const useNOCInbox = ({ tenantId, filters, config={} }) => {
    const { filterForm, searchForm , tableForm } = filters
    const { moduleName, businessService, applicationStatus, locality, assignee } = filterForm
    const { mobileNumber, applicationNumber } = searchForm
    const { sortBy, limit, offset, sortOrder } = tableForm
    // const USER_UUID = Digit.UserService.getUser()?.info?.uuid;
    // debugger
    const _filters = {
        tenantId,
        processSearchCriteria: {
          moduleName: "noc-services", 
          businessService: ["FIRE_NOC_SRV","FIRE_NOC_OFFLINE","AIRPORT_NOC_OFFLINE","AIRPORT_NOC_SRV"],
          ...(applicationStatus?.length > 0 ? {status: applicationStatus} : {}),
        },
        moduleSearchCriteria: {
          assignee,
          ...(mobileNumber ? {mobileNumber}: {}),
          ...(applicationNumber ? {applicationNumber} : {}),
          ...(sortOrder ? {sortOrder} : {}),
          ...(locality?.length > 0 ? {locality: locality.map((item) => item.code.split("_").pop()).join(",")} : {}),
        },
        sortBy,
        limit,
        offset,
        sortOrder
    }

    return useInbox({tenantId, filters: _filters, config:{
        select: (data) =>({
          statuses: data.statusMap,
          table: data?.items.map( application => ({
              applicationId: application.businessObject.applicationNo,
              date: parseInt(application.businessObject?.additionalDetails?.SubmittedOn),
              businessService: application?.ProcessInstance?.businessService,
              locality: `${application.businessObject?.tenantId?.toUpperCase()?.split(".")?.join("_")}`,
              status: application.businessObject.applicationStatus,
              owner: application.ProcessInstance?.assigner?.name,
              sla: Math.round(application.ProcessInstance?.businesssServiceSla / (24 * 60 * 60 * 1000))
          })),
          totalCount: data.totalCount
        }), 
        ...config 
      }
    })
}

export default useNOCInbox
