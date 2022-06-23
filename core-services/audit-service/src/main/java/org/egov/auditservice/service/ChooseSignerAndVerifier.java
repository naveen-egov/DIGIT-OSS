package org.egov.auditservice.service;

import lombok.extern.slf4j.Slf4j;
import org.egov.auditservice.web.models.AuditLogRequest;
import org.egov.tracer.model.CustomException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ChooseSignerAndVerifier {

    @Value("${audit.log.signing.algorithm}")
    private String signingAlgorithm;


    private final Map<String, ConfigurableSignAndVerify> signerAndVerifierByImplementationName;

    @Autowired
    public ChooseSignerAndVerifier(List<ConfigurableSignAndVerify> customSignAndVerifyImplementations){
        this.signerAndVerifierByImplementationName = customSignAndVerifyImplementations.stream().collect(Collectors.toMap(ConfigurableSignAndVerify::getSigningAlgorithm, Function.identity()));
    }

    public void selectImplementationAndSign(AuditLogRequest auditLogRequest){
        if(!signerAndVerifierByImplementationName.containsKey(signingAlgorithm)){
            throw new CustomException("EG_AUDIT_LOG_SIGNING_ERR", "Custom signer implementation is not present for the specified signing algorithm: " + signingAlgorithm);
        }

        // Selects signing implementation according to the configured signing algorithm
        ConfigurableSignAndVerify signAndVerifyUtil = signerAndVerifierByImplementationName.get(signingAlgorithm);

        // Signs audit logs
        signAndVerifyUtil.sign(auditLogRequest);
    }

    public void selectImplementationAndVerify(AuditLogRequest auditLogRequest){
        
    }
}
