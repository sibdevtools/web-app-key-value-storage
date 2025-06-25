import React, { useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Row } from 'react-bootstrap';
import { Delete01Icon, } from 'hugeicons-react';
import { contextPath } from '../../../const/common.const';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteKey, getKeys, getValue, ValueHolder } from '../../../api/api';
import { CustomTable, Loader } from '@sibdevtools/frontend-common';
import { CustomTableParts } from '@sibdevtools/frontend-common/dist/components/custom-table/types';

const SpaceKeysListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const [valueHolder, setValueHolder] = useState<ValueHolder>();
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [minorError, setMinorError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { space } = useParams();

  if (!space) {
    navigate(contextPath);
    return;
  }

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const response = await getKeys(space);
      if (response.data.success) {
        setKeys(response.data.body);
      } else {
        setError('Failed to fetch spaces');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);
      setError('Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      const response = await deleteKey(space, key);
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to delete key');
        return;
      }
      setKeys(keys.filter(it => it !== key));
    } catch (error) {
      console.error('Failed to delete key:', error);
      setMinorError('Failed to delete key');
    }
  };

  return (
    <Container className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <span className={'h2'}>Space {space} keys</span>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={{ span: 10, offset: 1 }}>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {minorError && (
            <Alert variant="danger" onClose={() => setMinorError(null)} dismissible>
              {minorError}
            </Alert>
          )}
          {!error && (
            <CustomTable
              table={{ responsive: true }}
              thead={{
                columns: {
                  key: {
                    label: 'Key',
                    sortable: true,
                    filterable: true,
                    className: 'text-center'
                  },
                  actions: {
                    label: 'Actions',
                    className: 'text-center'
                  }
                },
              }}
              tbody={{
                data: keys.map(key => {
                  return {
                    key: {
                      representation: <code>{key}</code>,
                      value: key,
                      className: 'text-center'
                    },
                    actions: {
                      representation:
                        <ButtonGroup>
                          <Button
                            variant={'danger'}
                            onClick={() => handleDelete(space)}
                            title={'Delete'}
                          >
                            <Delete01Icon />
                          </Button>
                        </ButtonGroup>
                    }
                  };
                }),
                rowBehavior: {
                  expandableContent: (row: CustomTableParts.Row) => {
                    const key = (row['key'] as CustomTableParts.ReactCell).value as string;
                    if (!key) {
                      return;
                    }

                    const fetchValue = async (key: string) => {
                      try {
                        const rs = await getValue(space, key);
                        if (rs.data.success) {
                          setValueHolder(rs.data.body);
                        } else {
                          setError('Failed to fetch value');
                          return;
                        }
                      } finally {
                        setContentLoading(false);
                      }
                    };

                    fetchValue(key);

                    return <Loader loading={contentLoading}>
                      <Container>
                        <Row>
                          <Col xs={6}>
                            <Row>
                              <Col xs={6}>
                                Created At
                              </Col>
                              <Col xs={6}>
                                {valueHolder?.meta.createdAt}
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={6}>
                                Modified At
                              </Col>
                              <Col xs={6}>
                                {valueHolder?.meta.modifiedAt}
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={6}>
                                Expired At
                              </Col>
                              <Col xs={6}>
                                {valueHolder?.meta.expiredAt}
                              </Col>
                            </Row>
                          </Col>
                          <Col xs={6}>
                            {valueHolder?.value}
                          </Col>
                        </Row>
                      </Container>
                    </Loader>;
                  }
                },
                pageSize: 50
              }}
              loading={loading}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SpaceKeysListPage;
