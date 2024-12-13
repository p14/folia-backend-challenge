import { Container } from "inversify";
import ValidationMiddleware from "./validation.middleware";
import TYPES from "../setup/ioc.types";

export default (container: Container) => {
    container
        .bind<ValidationMiddleware>(TYPES.Middleware.Validation)
        .to(ValidationMiddleware);
};
