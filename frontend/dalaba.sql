DO $$
DECLARE
    new_user_id bigint;
BEGIN
    -- Generate a new user_id from the user_sequence
    new_user_id := nextval('user_sequence');

    -- Insert the new user into the users table
    INSERT INTO users (id, comment, deleted, enabled, external_id, firstnames, lastname, updated_password_date, password, username, working_place_code, last_update_time)
    VALUES (new_user_id, 'Admin for Dalaba Municipality', false, true, 'EXT123456', 'Admin', 'Dalaba', NOW(), 'T53dw7UOfNbpovKFex9/Ldz8CMUF95gD', 'admin.dalaba', '00005', NOW());

    -- Insert the corresponding role into the user_roles table
    INSERT INTO user_roles (user_id, role)
    VALUES (new_user_id, 2);  -- Role ID for a municipality admin
END $$;
