const { EntitySchema } = require('typeorm');

const ApplicationEntity = new EntitySchema({
    name: 'Application',
    tableName: 'applications',
    columns: {
        id: {
            type: 'uuid',
            primary: true,
            default: () => 'gen_random_uuid()'
        },
        job_id: {
            type: String,
            length: 255,
            nullable: true
        },
        candidate_id: {
            type: String,
            length: 255,
            nullable: true
        },
        status: {
            type: String,
            length: 50,
            nullable: true
        },
        saga_state: {
            type: String,
            length: 50
        },
        created_at: {
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP'
        }
    }
});

module.exports = { ApplicationEntity };
