package gov.ravec.backend.exception;


public class NoSuchCustomerExistsException extends RuntimeException {

    public NoSuchCustomerExistsException(String message, Exception ex) {
        super(message, ex);
    }

    public NoSuchCustomerExistsException(String message) {
        super(message);
    }
}
